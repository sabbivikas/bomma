import { Story } from '@/types/doodle';

// Different download formats
export type DownloadFormat = 'original' | 'square' | 'reel' | 'landscape' | 'portrait';

// Format dimensions
const FORMAT_DIMENSIONS = {
  original: { width: 0, height: 0 }, // Will keep original dimensions
  square: { width: 1080, height: 1080 },
  reel: { width: 1080, height: 1920 },
  landscape: { width: 1280, height: 720 },
  portrait: { width: 1080, height: 1350 }
};

/**
 * Adds a watermark "bomma.art" to the image
 */
const addWatermark = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  const watermark = "bomma.art";
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.textAlign = "center";
  
  // Draw the white shadow for better contrast
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Position the watermark at the bottom center
  const x = canvas.width / 2;
  const y = canvas.height - 20;
  
  // Draw the watermark
  ctx.fillText(watermark, x, y);
  
  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
};

/**
 * Download a single image/frame with specified format
 */
export const downloadImage = (imageUrl: string, filename: string, format: DownloadFormat = 'original') => {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      let targetWidth = img.width;
      let targetHeight = img.height;
      
      // Set canvas size based on format
      if (format !== 'original') {
        targetWidth = FORMAT_DIMENSIONS[format].width;
        targetHeight = FORMAT_DIMENSIONS[format].height;
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Fill background with white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling and positioning to fit and center the image
      const scale = Math.min(
        targetWidth / img.width,
        targetHeight / img.height
      );
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;
      
      // Draw the image centered in the canvas
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Add watermark
      addWatermark(ctx, canvas);
      
      // Download the image
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      resolve();
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Download an animation as GIF or ZIP of frames
 */
export const downloadAnimation = async (story: Story, format: DownloadFormat = 'original', asGif: boolean = true) => {
  if (!story.frames.length) return;
  
  // If not requesting a GIF, download as a ZIP of images
  if (!asGif) {
    // Import JSZip dynamically to keep bundle size small
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Create a folder for the frames
    const folder = zip.folder(`${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_frames`);
    
    if (!folder) return;
    
    // Process each frame and add to ZIP
    for (let i = 0; i < story.frames.length; i++) {
      try {
        const frame = story.frames[i];
        
        // Create a promise to process the image
        const processedImage = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            if (!ctx) {
              reject(new Error("Could not get canvas context"));
              return;
            }
            
            let targetWidth = img.width;
            let targetHeight = img.height;
            
            // Set canvas size based on format
            if (format !== 'original') {
              targetWidth = FORMAT_DIMENSIONS[format].width;
              targetHeight = FORMAT_DIMENSIONS[format].height;
            }
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            // Fill background with white
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate scaling and positioning
            const scale = Math.min(
              targetWidth / img.width,
              targetHeight / img.height
            );
            
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (targetWidth - scaledWidth) / 2;
            const y = (targetHeight - scaledHeight) / 2;
            
            // Draw the image centered in the canvas
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
            // Add watermark
            addWatermark(ctx, canvas);
            
            // Return processed image data
            const dataUrl = canvas.toDataURL("image/png");
            const base64Data = dataUrl.split(',')[1];
            resolve(base64Data);
          };
          
          img.onerror = () => {
            reject(new Error("Failed to load image"));
          };
          
          img.src = frame.imageUrl;
        });
        
        // Add to zip
        folder.file(`frame_${i+1}.png`, processedImage, { base64: true });
      } catch (error) {
        console.error(`Error processing frame ${i+1}:`, error);
      }
    }
    
    // Generate and download zip
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_frames.zip`;
    link.href = URL.createObjectURL(content);
    link.click();
    
    return;
  }
  
  // For GIF creation, import the gif.js library dynamically
  try {
    // To be implemented when we add gif.js
    // For now, fall back to ZIP download
    alert("GIF download is not yet implemented. Downloading as ZIP instead.");
    await downloadAnimation(story, format, false);
  } catch (error) {
    console.error("Error creating GIF:", error);
    // Fall back to ZIP download
    await downloadAnimation(story, format, false);
  }
};

/**
 * Download story or single frame
 */
export const downloadStory = async (story: Story, format: DownloadFormat = 'original', downloadType: 'all' | 'current' = 'all', currentFrameIndex: number = 0) => {
  if (!story.frames.length) return;
  
  if (downloadType === 'current' && story.frames[currentFrameIndex]) {
    // Download just the current frame
    const frame = story.frames[currentFrameIndex];
    await downloadImage(
      frame.imageUrl,
      `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_frame_${currentFrameIndex+1}.png`,
      format
    );
  } else if (story.isAnimation) {
    // Download all frames as animation
    await downloadAnimation(story, format);
  } else {
    // For regular stories, just download each frame
    for (let i = 0; i < story.frames.length; i++) {
      const frame = story.frames[i];
      await downloadImage(
        frame.imageUrl,
        `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_frame_${i+1}.png`,
        format
      );
    }
  }
};
