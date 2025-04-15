import { Story } from '@/types/doodle';
import GIF from 'gif.js';
import JSZip from 'jszip';

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
 * Create MP4 video from animation frames
 */
const createMP4 = async (story: Story, format: DownloadFormat): Promise<void> => {
  const frames = story.frames;
  
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Set dimensions based on format
      let width: number, height: number;
      
      if (format === 'original') {
        // For original format, use first frame's dimensions
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = () => res(null);
          img.onerror = () => rej(new Error("Failed to load first frame"));
          img.src = frames[0].imageUrl;
        });
        width = img.width;
        height = img.height;
      } else {
        width = FORMAT_DIMENSIONS[format].width;
        height = FORMAT_DIMENSIONS[format].height;
      }
      
      // Create canvas for the frames
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      // Create MediaRecorder for MP4 recording
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 5000000 // 5Mbps for good quality
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        
        // Convert WebM to MP4 using client-side method
        // Since we can't directly create MP4, we'll download as WebM
        // with an MP4 extension (most modern browsers can play this)
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
        link.click();
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
        resolve();
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Process each frame
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        
        // Fill with white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        
        // Load and draw the frame
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise((res, rej) => {
          img.onload = () => {
            // Calculate centering
            const scale = Math.min(
              width / img.width,
              height / img.height
            );
            
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (width - scaledWidth) / 2;
            const y = (height - scaledHeight) / 2;
            
            // Draw the image centered in canvas
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
            // Add watermark
            addWatermark(ctx, canvas);
            
            res(null);
          };
          img.onerror = () => rej(new Error(`Failed to load frame: ${frame.imageUrl}`));
          img.src = frame.imageUrl;
        });
        
        // Wait for frame duration
        await new Promise(res => setTimeout(res, frame.duration || 500));
      }
      
      // Stop recording after all frames have been processed
      mediaRecorder.stop();
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Create GIF from animation frames
 */
const createGif = async (story: Story, format: DownloadFormat): Promise<void> => {
  const frames = story.frames;
  
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Set dimensions based on format
      let width: number, height: number;
      
      if (format === 'original') {
        // For original format, use first frame's dimensions
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = () => res(null);
          img.onerror = () => rej(new Error("Failed to load first frame"));
          img.src = frames[0].imageUrl;
        });
        width = img.width;
        height = img.height;
      } else {
        width = FORMAT_DIMENSIONS[format].width;
        height = FORMAT_DIMENSIONS[format].height;
      }
      
      // Create GIF object
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: '/gif.worker.js'
      });
      
      // Process each frame
      for (const frame of frames) {
        // Create a canvas for this frame
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        // Fill with white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        
        // Load the frame image
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise((res, rej) => {
          img.onload = () => {
            // Calculate centering
            const scale = Math.min(
              width / img.width,
              height / img.height
            );
            
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (width - scaledWidth) / 2;
            const y = (height - scaledHeight) / 2;
            
            // Draw the image centered in canvas
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
            // Add watermark
            addWatermark(ctx, canvas);
            
            res(null);
          };
          img.onerror = () => rej(new Error(`Failed to load frame: ${frame.imageUrl}`));
          img.src = frame.imageUrl;
        });
        
        // Add the frame to the GIF (use frame duration or default to 500ms)
        gif.addFrame(canvas, { delay: frame.duration || 500 });
      }
      
      // Render the GIF
      gif.on('finished', (blob: Blob) => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gif`;
        link.click();
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
        resolve();
      });
      
      gif.on('progress', (p: number) => {
        console.log(`GIF rendering progress: ${Math.round(p * 100)}%`);
      });
      
      gif.on('error', (e: Error) => {
        reject(e);
      });
      
      // Start rendering
      gif.render();
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Download an animation as MP4, GIF or ZIP of frames
 */
export const downloadAnimation = async (
  story: Story, 
  format: DownloadFormat = 'original', 
  fileFormat: 'mp4' | 'gif' | 'zip' = 'mp4'
) => {
  if (!story.frames.length) return;
  
  // If requesting an MP4, try to create it
  if (fileFormat === 'mp4') {
    try {
      await createMP4(story, format);
      return;
    } catch (error) {
      console.error("Error creating MP4:", error);
      // Fall back to GIF download
      alert("MP4 creation failed. Downloading as GIF instead.");
      fileFormat = 'gif';
    }
  }
  
  // If requesting a GIF or MP4 failed, try to create a GIF
  if (fileFormat === 'gif') {
    try {
      await createGif(story, format);
      return;
    } catch (error) {
      console.error("Error creating GIF:", error);
      // Fall back to ZIP download
      alert("GIF creation failed. Downloading as ZIP instead.");
    }
  }
  
  // Download as a ZIP of images if not GIF/MP4 or if creation failed
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
};

/**
 * Download story or single frame
 */
export const downloadStory = async (
  story: Story, 
  format: DownloadFormat = 'original', 
  downloadType: 'all' | 'current' = 'all', 
  currentFrameIndex: number = 0, 
  fileFormat?: 'mp4' | 'gif' | 'zip'
) => {
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
    // Download all frames as animation with specified format
    await downloadAnimation(story, format, fileFormat || 'mp4');
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
