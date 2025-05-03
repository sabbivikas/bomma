
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
    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
    
    // Check if the prompt is asking for direct drawing
    const isDrawingRequest = prompt.toLowerCase().match(/(add|draw|put|place|create|make|include)/);
    
    // Modify the prompt to specifically request an image if possible
    let promptText = prompt;
    if (isDrawingRequest) {
      promptText = `Enhance this drawing by ${prompt}. Return the modified image if possible, or detailed instructions on how to modify it.`;
    } else {
      promptText = `Enhance this drawing according to this description: "${prompt}". Return the enhanced image if possible.`;
    }
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
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
        temperature: 0.9,
        top_p: 1,
        top_k: 32
      }
    };

    const geminiResponse = await fetch(`${geminiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const responseData = await geminiResponse.json();

    // Step 4: Debug the raw Gemini response
    console.log("⚠️ DEBUG: Raw Gemini response:");
    console.log(JSON.stringify(responseData, null, 2));

    // Step 5: Extract the enhanced image if available
    let imageData = null;
    let textResponse = null;
    let parsedInstructions = null;

    // Check for any parts in the response
    const parts = responseData?.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      // Check for inline data (image)
      if (part.inline_data && part.inline_data.mime_type?.startsWith("image/")) {
        imageData = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
        break;
      } 
      // Check for text response
      else if (part.text) {
        textResponse = part.text;
        
        // Try to parse instructions from text response for drawing
        try {
          // Look for ASCII art in response
          const asciiArtMatch = textResponse.match(/```([\s\S]*?)```/);
          if (asciiArtMatch && asciiArtMatch[1]) {
            parsedInstructions = {
              type: "ascii_art",
              content: asciiArtMatch[1].trim()
            };
          }
          
          // If no ASCII art but text contains drawing instructions
          else if (textResponse.toLowerCase().includes("add") || 
                   textResponse.toLowerCase().includes("draw") ||
                   textResponse.toLowerCase().includes("create")) {
            // Identify what to draw
            parsedInstructions = {
              type: "text_instructions",
              content: textResponse
            };
            
            // Try to extract specific elements to draw
            const elementMatches = textResponse.match(/add (.*?)(?:to|on|above|below|\.|\,)/i);
            if (elementMatches && elementMatches[1]) {
              parsedInstructions.element = elementMatches[1].trim();
            }
          }
        } catch (parseError) {
          console.log("Error parsing instructions:", parseError);
        }
      }
    }

    const resultPayload = {
      success: true,
      message: imageData ? "Image enhanced successfully" : "AI provided a text response",
      imageData: imageData,
      textResponse: textResponse,
      parsedInstructions: parsedInstructions,
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
