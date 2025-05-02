
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { image, prompt } = await req.json();

    if (!image || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Image and prompt are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the Gemini API key from Supabase secrets
    const apiKey = Deno.env.get('GEMINI_CO_DRAWING');
    if (!apiKey) {
      console.error('GEMINI_CO_DRAWING API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log("Calling Gemini API to enhance drawing with prompt:", prompt);

    // Extract base64 image data from data URL
    const base64Image = image.split(',')[1];
    
    // Make request to Gemini API
    const geminiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent";
    
    const response = await fetch(`${geminiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `The user has drawn an image and wants your help enhancing it with the following prompt: "${prompt}". 
                Generate an improved version of this image based on the prompt.
                If you can generate an image response, please do so. Otherwise, provide detailed suggestions on how to improve the drawing.` },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.7,
          max_output_tokens: 2048
        }
      })
    });

    const data = await response.json();
    console.log("Received response from Gemini API");

    // Check if the response contains an image part
    let imageData = null;
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
      
      const parts = data.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inline_data && part.inline_data.mime_type.startsWith('image/')) {
          imageData = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
          break;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Drawing enhancement processed",
        result: data,
        imageData: imageData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
