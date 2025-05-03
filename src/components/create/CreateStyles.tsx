
import React from 'react';

const CreateStyles = () => {
  return (
    <style>
      {`
      .ghibli-sparkle {
        position: absolute;
        background-color: white;
        border-radius: 50%;
        box-shadow: 0 0 10px 2px white;
        animation: sparkle-float 8s ease-in-out infinite;
        z-index: 5;
      }
      
      @keyframes sparkle-float {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
        50% { transform: translateY(-30px) scale(1.2); opacity: 0.7; }
      }

      .animate-pop-in {
        animation: pop-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes pop-in {
        0% { opacity: 0; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1); }
      }

      .animate-fade-in {
        animation: fade-in 0.4s ease-in forwards;
      }

      @keyframes fade-in {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      .dreamy-dust {
        position: absolute;
        background-color: white;
        border-radius: 50%;
        opacity: 0.5;
        animation: float 10s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-20px) translateX(10px); }
      }
      
      /* Canvas styling - improved to match design */
      canvas {
        border-radius: 0;
        background: linear-gradient(180deg, rgba(230, 242, 255, 0.8) 0%, rgba(240, 235, 255, 0.8) 100%);
        width: 100% !important;
        max-width: 100% !important;
        height: auto;
        aspect-ratio: 16/10;
        display: block;
        border: none !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      }
      
      /* Remove any margins or padding that might be causing white space */
      .drawing-canvas-container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden;
      }
      
      /* Drawing tools container styling */
      .drawing-tools-container {
        background-color: rgba(255, 255, 255, 0.7) !important;
        backdrop-filter: blur(4px);
        border-top: 1px solid rgba(209, 213, 219, 0.5);
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      
      /* Remove any horizontal scrolling */
      body, html, #root {
        overflow-x: hidden;
      }
      
      /* iPad-specific styles */
      @media (min-width: 768px) and (max-width: 1024px) {
        /* Ensure touch targets are large enough */
        button, .toggle-group-item {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Better spacing for iPad */
        .gap-2 {
          gap: 0.75rem !important;
        }
      }
      `}
    </style>
  );
};

export default CreateStyles;
