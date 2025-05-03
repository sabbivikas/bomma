import React, { useRef, useState } from 'react';

export default function CoDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const drawOnCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSend = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');

    setLoading(true);

    try {
      const res = await fetch('/functions/v1/enhance-drawing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, prompt })
      });

      const result = await res.json();
      if (result.imageData) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          ctx?.drawImage(img, 0, 0);
        };
        img.src = result.imageData;
      } else {
        alert(result.message || 'No image returned.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - http://rect.top;

    drawOnCanvas(ctx, x, y);

    const moveHandler = (moveEvent: MouseEvent) => {
      const moveX = moveEvent.clientX - rect.left;
      const moveY = moveEvent.clientY - http://rect.top;
      drawOnCanvas(ctx, moveX, moveY);
    };

    const upHandler = () => {
      canvas.removeEventListener('mousemove', moveHandler);
      canvas.removeEventListener('mouseup', upHandler);
      ctx.beginPath();
    };

    canvas.addEventListener('mousemove', moveHandler);
    canvas.addEventListener('mouseup', upHandler);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Co-Drawing with Gemini</h2>
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
        onMouseDown={handleMouseDown}
      />
      <div style={{ marginTop: 16 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(http://e.target.value)}
          placeholder="Describe what to add (e.g. 'Add blue eyes')"
          style={{ width: '300px', marginRight: '8px' }}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
