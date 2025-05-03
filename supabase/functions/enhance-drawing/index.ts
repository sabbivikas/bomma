
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
    
    // Check common prompt types to provide better instructions to the AI
    const promptLower = prompt.toLowerCase();
    const isColorRequest = promptLower.match(/(color|fill|paint|tint)/);
    const isDrawingRequest = promptLower.match(/(add|draw|put|place|create|make|include)/);
    const isEyesRequest = promptLower.includes('eye');
    const isMouthRequest = promptLower.includes('mouth') || promptLower.includes('smile') || promptLower.includes('frown');
    const isHairRequest = promptLower.includes('hair');
    const isHatRequest = promptLower.includes('hat') || promptLower.includes('cap');
    
    // Construct a more specific prompt based on what the user is asking for
    let promptText = prompt;
    let shouldGenerateImage = true;
    
    if (isColorRequest) {
      promptText = `Enhance this drawing by adding color as requested: "${prompt}". If you can generate a colored version of this image, return it. Otherwise, provide specific instructions about what colors to use and where.`;
    } 
    else if (isEyesRequest) {
      promptText = `Add eyes to this drawing. Based on the prompt: "${prompt}". Return specific drawing instructions about where to place the eyes, their size, color, and style.`;
      shouldGenerateImage = false;  // For simple features, instructions might be better
    } 
    else if (isMouthRequest) {
      promptText = `Add a ${promptLower.includes('smile') ? 'smiling' : promptLower.includes('frown') ? 'frowning' : 'neutral'} mouth to this drawing. Based on the prompt: "${prompt}". Return specific drawing instructions about the mouth's position, size, and style.`;
      shouldGenerateImage = false;
    }
    else if (isHairRequest) {
      promptText = `Add ${promptLower.includes('long') ? 'long' : promptLower.includes('short') ? 'short' : promptLower.includes('spiky') ? 'spiky' : 'appropriate'} hair to this drawing. Based on the prompt: "${prompt}". If possible, return an enhanced image with the hair added.`;
    }
    else if (isHatRequest) {
      promptText = `Add a ${promptLower.includes('top') ? 'top' : promptLower.includes('cowboy') ? 'cowboy' : 'suitable'} hat to this drawing. Based on the prompt: "${prompt}". If possible, return an enhanced image with the hat added.`;
    }
    else if (isDrawingRequest) {
      promptText = `Enhance this drawing according to: "${prompt}". Return the modified image if possible, or provide detailed instructions on how to modify it.`;
    }
    else {
      promptText = `Enhance this drawing according to this description: "${prompt}". Return the enhanced image if possible, or detailed instructions on how I should update the drawing.`;
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
        top_k: 32,
        response_mime_type: shouldGenerateImage ? "image/png" : "text/plain"
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
        
        // Extract colors mentioned in the text
        const colorExtractor = /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey|gold|silver|cyan|magenta|turquoise|violet)\b/gi;
        const colorMatches = textResponse.match(colorExtractor) || [];
        const uniqueColors = [...new Set(colorMatches.map(c => c.toLowerCase()))];
        
        // Try to parse instructions from text response for drawing
        try {
          // Look for ASCII art in response
          const asciiArtMatch = textResponse.match(/```([\s\S]*?)```/);
          if (asciiArtMatch && asciiArtMatch[1]) {
            parsedInstructions = {
              type: "ascii_art",
              content: asciiArtMatch[1].trim(),
              colors: uniqueColors
            };
          }
          
          // If text contains color instructions
          else if (isColorRequest) {
            parsedInstructions = {
              type: "color_instructions",
              content: textResponse,
              colors: uniqueColors
            };
          }
          
          // If text contains drawing instructions
          else if (textResponse.toLowerCase().includes("add") || 
                  textResponse.toLowerCase().includes("draw") ||
                  textResponse.toLowerCase().includes("create")) {
            // Identify what to draw
            parsedInstructions = {
              type: "text_instructions",
              content: textResponse,
              colors: uniqueColors
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
