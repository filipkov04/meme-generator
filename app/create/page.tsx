'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import MemeCanvas from '@/components/meme/MemeCanvas';
import MemeControls from '@/components/meme/MemeControls';
import TemplateSelector from '@/components/meme/TemplateSelector';

interface TextBox {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
}

export default function CreatePage() {
  const auth = db.useAuth();
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Impact');
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!auth?.user) {
      router.push('/auth');
    }
  }, [auth?.user, router]);


  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setCurrentImage(img);
        setActiveTemplate(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleTemplateSelect = (imagePath: string) => {
    const img = new Image();
    img.onload = () => {
      setCurrentImage(img);
      setActiveTemplate(imagePath);
    };
    img.onerror = () => {
      console.error('Failed to load template image:', imagePath);
      alert('Failed to load template image. Please try again.');
    };
    img.src = imagePath;
  };

  const handleAddTextBox = () => {
    const canvas = canvasRef.current;
    const width = canvas?.width || 800;
    const height = canvas?.height || 600;
    
    const newTextBox: TextBox = {
      id: Date.now(),
      text: 'Your text here',
      x: width / 2,
      y: height / 2,
      fontSize: fontSize,
    };
    setTextBoxes([...textBoxes, newTextBox]);
  };

  const handleDownload = () => {
    if (!currentImage && textBoxes.length === 0) {
      alert('Please upload an image and add some text first!');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentImage) {
      canvas.width = currentImage.width;
      canvas.height = currentImage.height;
      ctx.drawImage(currentImage, 0, 0);

      const scaleX = currentImage.width / (canvasRef.current?.width || 800);
      const scaleY = currentImage.height / (canvasRef.current?.height || 600);

      textBoxes.forEach((textBox) => {
        ctx.save();
        const scaledFontSize = textBox.fontSize * Math.min(scaleX, scaleY);
        ctx.font = `${scaledFontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const scaledX = textBox.x * scaleX;
        const scaledY = textBox.y * scaleY;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(6, scaledFontSize / 8);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(textBox.text, scaledX, scaledY);

        ctx.fillStyle = textColor;
        ctx.fillText(textBox.text, scaledX, scaledY);

        ctx.restore();
      });
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handlePostMeme = async () => {
    if (!currentImage && textBoxes.length === 0) {
      alert('Please upload an image and add some text first!');
      return;
    }

    if (!auth?.user) {
      router.push('/auth');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentImage) {
      canvas.width = currentImage.width;
      canvas.height = currentImage.height;
      ctx.drawImage(currentImage, 0, 0);

      const displayCanvas = canvasRef.current;
      const scaleX = displayCanvas ? currentImage.width / displayCanvas.width : 1;
      const scaleY = displayCanvas ? currentImage.height / displayCanvas.height : 1;

      textBoxes.forEach((textBox) => {
        ctx.save();
        const scaledFontSize = textBox.fontSize * Math.min(scaleX, scaleY);
        ctx.font = `${scaledFontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const scaledX = textBox.x * scaleX;
        const scaledY = textBox.y * scaleY;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(6, scaledFontSize / 8);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(textBox.text, scaledX, scaledY);

        ctx.fillStyle = textColor;
        ctx.fillText(textBox.text, scaledX, scaledY);

        ctx.restore();
      });
    }

    const imageData = canvas.toDataURL('image/png');

    try {
      const memeId = await db.getLocalId('meme');
      await db.transact(
        db.tx.memes[memeId].update({
          imageData,
          textBoxes: JSON.stringify(textBoxes),
          createdAt: Date.now(),
          createdBy: auth.user.id,
          upvoteCount: 0,
        })
      );

      // Show success message briefly before redirecting
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.textContent = 'Meme posted successfully!';
      successMsg.style.position = 'fixed';
      successMsg.style.top = '20px';
      successMsg.style.right = '20px';
      successMsg.style.zIndex = '10000';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        document.body.removeChild(successMsg);
        router.push('/browse');
      }, 1500);
    } catch (error: any) {
      console.error('Error posting meme:', error);
      alert('Failed to post meme: ' + (error.message || 'Please try again.'));
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Help Brands Scale.<br />Create Memes Forever.</h1>
        <p>
          Refer once. Earn forever. Our meme program offers generous lifetime
          laughs for every brand you successfully meme.
        </p>
      </header>

      <div className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TemplateSelector
            onTemplateSelect={handleTemplateSelect}
            activeTemplate={activeTemplate}
          />
          <MemeControls
            fontSize={fontSize}
            textColor={textColor}
            fontFamily={fontFamily}
            textBoxes={textBoxes}
            onFontSizeChange={(size) => {
              setFontSize(size);
              setTextBoxes(
                textBoxes.map((box) => ({ ...box, fontSize: size }))
              );
            }}
            onTextColorChange={setTextColor}
            onFontFamilyChange={setFontFamily}
            onAddTextBox={handleAddTextBox}
            onTextBoxUpdate={setTextBoxes}
            onImageUpload={handleImageUpload}
          />
          <div className="control-group" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button onClick={handleDownload} className="btn btn-download" style={{ width: '100%', marginBottom: '12px' }}>
              Download Meme
            </button>
            <button onClick={handlePostMeme} className="btn btn-post" style={{ width: '100%' }}>
              Post Meme
            </button>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <MemeCanvas
            currentImage={currentImage}
            textBoxes={textBoxes}
            textColor={textColor}
            fontFamily={fontFamily}
            onImageLoad={setCurrentImage}
            onTextBoxUpdate={setTextBoxes}
            canvasRef={canvasRef}
          />
        </div>
      </div>
    </div>
  );
}

