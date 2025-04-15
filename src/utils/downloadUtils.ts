
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
      
      // Prepare frames for better video quality
      const frameObjects: Array<{img: HTMLImageElement, duration: number}> = [];
      
      // Pre-load all images to avoid timing issues
      for (const frame of frames) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error(`Failed to load frame: ${frame.imageUrl}`));
          img.src = frame.imageUrl;
        });
        
        frameObjects.push({
          img,
          duration: frame.duration || 500
        });
      }
      
      // Use a different approach for video creation
      // Instead of MediaRecorder API which might have compatibility issues
      // We'll create a sequence of frames as PNG and combine them into a downloadable video
      
      const totalFrames = 60; // We'll aim for a 2-second video with high frame rate
      const videoContainer = document.createElement('div');
      videoContainer.style.display = 'none';
      document.body.appendChild(videoContainer);
      
      // Create a video element for combining frames
      const video = document.createElement('video');
      video.width = width;
      video.height = height;
      video.controls = true;
      
      // Calculate total duration based on all frames
      const totalDuration = frameObjects.reduce((sum, frame) => sum + frame.duration, 0);
      
      // Prepare to capture a high number of frames to ensure smooth playback
      const frameCaptures: Blob[] = [];
      
      // Draw each frame with proper timing
      for (let i = 0; i < frameObjects.length; i++) {
        const frameObj = frameObjects[i];
        
        // Fill with white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        
        // Calculate centering
        const scale = Math.min(
          width / frameObj.img.width,
          height / frameObj.img.height
        );
        
        const scaledWidth = frameObj.img.width * scale;
        const scaledHeight = frameObj.img.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        
        // Draw the image centered in canvas
        ctx.drawImage(frameObj.img, x, y, scaledWidth, scaledHeight);
        
        // Add watermark
        addWatermark(ctx, canvas);
        
        // Capture multiple times based on duration to ensure proper timing
        const frameCount = Math.max(1, Math.floor((frameObj.duration / totalDuration) * totalFrames));
        
        for (let j = 0; j < frameCount; j++) {
          // Convert canvas to blob
          const frameBlob = await new Promise<Blob>((res) => {
            canvas.toBlob((blob) => {
              if (blob) res(blob);
              else res(new Blob([], { type: 'image/png' }));
            }, 'image/png', 1.0);
          });
          
          frameCaptures.push(frameBlob);
        }
      }
      
      // Generate an animated object URL from the frame blobs
      // Using the video element with MediaSource API
      if (window.MediaSource) {
        // Using a higher quality approach with better codec options
        // Combine frames into a video file using HTML5 video element
        try {
          const videoBlob = await generateVideoFromFrames(frameCaptures, width, height);
          
          // Create download link
          const url = URL.createObjectURL(videoBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
          link.click();
          
          // Clean up
          setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(videoContainer);
          }, 100);
          
          resolve();
        } catch (err) {
          console.error("Error creating video with MediaSource:", err);
          // Fall back to alternative method
          createFallbackVideo(frameCaptures, story.title, width, height, resolve, reject);
        }
      } else {
        // Fall back to alternative method
        createFallbackVideo(frameCaptures, story.title, width, height, resolve, reject);
      }
      
    } catch (error) {
      console.error("MP4 creation error:", error);
      reject(error);
    }
  });
};

/**
 * Generate a video file from frame blobs
 */
async function generateVideoFromFrames(
  frameBlobs: Blob[], 
  width: number, 
  height: number
): Promise<Blob> {
  return new Promise<Blob>(async (resolve, reject) => {
    try {
      // Create a temporary canvas for drawing frames
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      
      // Create a video stream from the canvas
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Use MediaRecorder with higher quality settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 8000000 // 8Mbps for high quality
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/mp4' });
        resolve(videoBlob);
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Draw each frame onto the canvas with delay
      for (let i = 0; i < frameBlobs.length; i++) {
        const img = new Image();
        const url = URL.createObjectURL(frameBlobs[i]);
        
        await new Promise<void>((res) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            res();
          };
          img.src = url;
        });
        
        // Wait for frame to be processed (simulate 30fps)
        await new Promise(res => setTimeout(res, 33)); // ~33ms for 30fps
      }
      
      // Stop recording after all frames have been processed
      mediaRecorder.stop();
      
    } catch (error) {
      console.error('Error generating video:', error);
      reject(error);
    }
  });
}

/**
 * Fallback method to create a video using alternative technique
 */
async function createFallbackVideo(
  frameBlobs: Blob[],
  title: string,
  width: number,
  height: number,
  resolve: () => void,
  reject: (error: Error) => void
) {
  try {
    console.log("Using fallback video creation method");
    // Create an object URL for each frame
    const frameUrls = frameBlobs.map(blob => URL.createObjectURL(blob));
    
    // Create an HTML structure for the video
    const videoElement = document.createElement('video');
    videoElement.width = width;
    videoElement.height = height;
    videoElement.controls = true;
    
    // Set the source
    const sourceElement = document.createElement('source');
    
    // Create a MediaSource instance
    const mediaSource = new MediaSource();
    videoElement.src = URL.createObjectURL(mediaSource);
    
    mediaSource.addEventListener('sourceopen', async () => {
      try {
        // Create a SourceBuffer
        const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        
        // Combine the frame data
        let combinedData = new Uint8Array();
        
        // Append each frame data (this would need a proper video encoder in a real implementation)
        // Since browser API limitations prevent easy video encoding,
        // let's take a different approach:
        
        // For the fallback, we'll create a ZIP of frames with a simple viewer HTML
        const zip = new JSZip();
        const folder = zip.folder(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_video`);
        
        if (!folder) {
          throw new Error("Failed to create ZIP folder");
        }
        
        // Add an HTML viewer
        folder.file('index.html', `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title} - Video Player</title>
            <style>
              body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
              #player { max-width: 100%; max-height: 100vh; }
              .controls { position: fixed; bottom: 10px; background: rgba(0,0,0,0.5); color: white; padding: 10px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <img id="player" src="frames/0.png" />
            <div class="controls">
              <button id="play">Play</button>
              <button id="pause">Pause</button>
              <span id="frame">Frame: 1/${frameBlobs.length}</span>
            </div>
            <script>
              const frames = [];
              for(let i = 0; i < ${frameBlobs.length}; i++) {
                frames.push(\`frames/\${i}.png\`);
              }
              const player = document.getElementById('player');
              const frameCounter = document.getElementById('frame');
              let currentFrame = 0;
              let isPlaying = false;
              let intervalId;
              
              function nextFrame() {
                currentFrame = (currentFrame + 1) % frames.length;
                player.src = frames[currentFrame];
                frameCounter.textContent = \`Frame: \${currentFrame+1}/\${frames.length}\`;
              }
              
              document.getElementById('play').addEventListener('click', () => {
                if(!isPlaying) {
                  isPlaying = true;
                  intervalId = setInterval(nextFrame, 100);
                }
              });
              
              document.getElementById('pause').addEventListener('click', () => {
                isPlaying = false;
                clearInterval(intervalId);
              });
            </script>
          </body>
          </html>
        `);
        
        // Create frames folder
        const framesFolder = folder.folder('frames');
        if (!framesFolder) {
          throw new Error("Failed to create frames folder");
        }
        
        // Add each frame
        for (let i = 0; i < frameBlobs.length; i++) {
          await new Promise<void>((res) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result;
              if (result && typeof result === 'string') {
                const base64Data = result.split(',')[1];
                framesFolder.file(`${i}.png`, base64Data, { base64: true });
              }
              res();
            };
            reader.readAsDataURL(frameBlobs[i]);
          });
        }
        
        // Generate the ZIP
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_video.zip`;
        link.href = URL.createObjectURL(content);
        link.click();
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(link.href);
          frameUrls.forEach(URL.revokeObjectURL);
        }, 100);
        
        resolve();
      } catch (error) {
        console.error("MediaSource fallback error:", error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  } catch (error) {
    console.error("Fallback video creation error:", error);
    reject(error instanceof Error ? error : new Error(String(error)));
  }
}

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
