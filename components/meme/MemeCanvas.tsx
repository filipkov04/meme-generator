'use client';

import { useEffect, useRef, useState } from 'react';

interface TextBox {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
}

interface MemeCanvasProps {
  currentImage: HTMLImageElement | null;
  textBoxes: TextBox[];
  textColor: string;
  fontFamily: string;
  onImageLoad: (img: HTMLImageElement) => void;
  onTextBoxUpdate: (boxes: TextBox[]) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export default function MemeCanvas({
  currentImage,
  textBoxes,
  textColor,
  fontFamily,
  onImageLoad,
  onTextBoxUpdate,
  canvasRef: externalCanvasRef,
}: MemeCanvasProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<TextBox | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas
    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image if available
    if (currentImage) {
      resizeCanvasToImage(currentImage, canvas);
      ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    }

    // Draw text boxes
    textBoxes.forEach((textBox) => {
      ctx.save();
      ctx.font = `${textBox.fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw black stroke
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(6, textBox.fontSize / 8);
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(textBox.text, textBox.x, textBox.y);

      // Draw text fill
      ctx.fillStyle = textColor;
      ctx.fillText(textBox.text, textBox.x, textBox.y);

      ctx.restore();
    });
  }, [currentImage, textBoxes, textColor, fontFamily]);

  const resizeCanvasToImage = (img: HTMLImageElement, canvas: HTMLCanvasElement) => {
    const maxWidth = 800;
    const maxHeight = 600;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if clicking on a text box
    for (let i = textBoxes.length - 1; i >= 0; i--) {
      const textBox = textBoxes[i];
      ctx.font = `${textBox.fontSize}px ${fontFamily}`;
      const metrics = ctx.measureText(textBox.text);
      const textWidth = metrics.width;
      const textHeight = textBox.fontSize;

      const left = textBox.x - textWidth / 2;
      const right = textBox.x + textWidth / 2;
      const top = textBox.y - textHeight / 2;
      const bottom = textBox.y + textHeight / 2;

      if (x >= left && x <= right && y >= top && y <= bottom) {
        setIsDragging(true);
        setDragTarget(textBox);
        setDragOffset({ x: x - textBox.x, y: y - textBox.y });
        canvas.style.cursor = 'grabbing';
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging && dragTarget) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const updatedBoxes = textBoxes.map((box) => {
        if (box.id === dragTarget.id) {
          return {
            ...box,
            x: Math.max(0, Math.min(canvas.width, x - dragOffset.x)),
            y: Math.max(0, Math.min(canvas.height, y - dragOffset.y)),
          };
        }
        return box;
      });

      onTextBoxUpdate(updatedBoxes);
    } else if (currentImage) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let hovering = false;
      for (let i = textBoxes.length - 1; i >= 0; i--) {
        const textBox = textBoxes[i];
        ctx.font = `${textBox.fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(textBox.text);
        const textWidth = metrics.width;
        const textHeight = textBox.fontSize;

        const left = textBox.x - textWidth / 2;
        const right = textBox.x + textWidth / 2;
        const top = textBox.y - textHeight / 2;
        const bottom = textBox.y + textHeight / 2;

        if (x >= left && x <= right && y >= top && y <= bottom) {
          hovering = true;
          break;
        }
      }
      canvas.style.cursor = hovering ? 'grab' : 'default';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragTarget(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          onImageLoad(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="canvas-panel">
      <canvas
        ref={canvasRef}
        id="meme-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {!currentImage && (
        <p className="canvas-hint" id="canvas-hint">
          Upload an image or select a template to get started
        </p>
      )}
    </div>
  );
}

