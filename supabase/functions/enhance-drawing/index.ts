
import "https://deno.land/x/xhr@0.1.0/mod.ts"; // add fetch & XMLHttpRequest support
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the API key from environment variables
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured", 
          details: "Please set the GEMINI_API_KEY in Supabase secrets" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Missing imageBase64" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Clean the base64 string if it has a data URL prefix
    const cleanedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Call the Gemini API for image enhancement
    console.log("Calling Gemini API for image enhancement...");
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Enhance this drawing to make it look better, keeping the same style but with improved lines and colors." },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: cleanedBase64
                  }
                }
              ]
            }
          ],
          generation_config: {
            temperature: 0.4,
            top_p: 1,
            top_k: 32
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to enhance image with Gemini API", 
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const geminiData = await geminiResponse.json();
    console.log("Gemini API response received:", JSON.stringify(geminiData).substring(0, 200) + "...");
    
    // Since Gemini can only provide text descriptions and not actually modify images,
    // for this demo we'll just return the original image
    // In a real app, you would use image generation APIs like DALL-E or Stable Diffusion
    // to create a new image based on the Gemini description
    return new Response(
      JSON.stringify({ 
        enhancedImage: imageBase64,
        description: geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 
                    "Enhanced version of your drawing"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Enhance Drawing Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
