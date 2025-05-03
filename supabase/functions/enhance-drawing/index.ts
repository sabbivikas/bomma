
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Parse incoming request
    const { image, prompt } = await req.json();

    if (!image || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Image and prompt are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const apiKey = Deno.env.get('GEMINI_CO_DRAWING');
    if (!apiKey) {
      console.error('GEMINI_CO_DRAWING API key not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log("Calling Gemini API to enhance drawing with prompt:", prompt);

    // Step 2: Prepare image data
    const base64Image = image.split(',')[1];

    // Step 3: Make Gemini API request
    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent";

    const geminiResponse = await fetch(`${geminiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModality: ["IMAGE"]
        }
      })
    });

    const responseData = await geminiResponse.json();

    // Step 4: Debug the raw Gemini response
    console.log("⚠️ DEBUG: Raw Gemini response:");
    console.log(JSON.stringify(data, null, 2));
    console.log(JSON.stringify(responseData, null, 2));

    // Step 5: Extract the enhanced image if available
    let imageData = null;
    const parts = responseData?.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
        imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    const resultPayload = {
      success: true,
      message: imageData ? "Image enhanced successfully" : "No image returned by Gemini",
      imageData: imageData,
      debug: responseData
    };

    return new Response(JSON.stringify(resultPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
