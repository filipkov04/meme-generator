'use client';

import { useState } from 'react';

interface TextBox {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
}

interface MemeControlsProps {
  fontSize: number;
  textColor: string;
  fontFamily: string;
  textBoxes: TextBox[];
  onFontSizeChange: (size: number) => void;
  onTextColorChange: (color: string) => void;
  onFontFamilyChange: (family: string) => void;
  onAddTextBox: () => void;
  onTextBoxUpdate: (boxes: TextBox[]) => void;
  onImageUpload: (file: File) => void;
}

export default function MemeControls({
  fontSize,
  textColor,
  fontFamily,
  textBoxes,
  onFontSizeChange,
  onTextColorChange,
  onFontFamilyChange,
  onAddTextBox,
  onTextBoxUpdate,
  onImageUpload,
}: MemeControlsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleUploadClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault();
    document.getElementById('image-upload')?.click();
  };

  const handleTextBoxTextChange = (id: number, text: string) => {
    const updated = textBoxes.map((box) =>
      box.id === id ? { ...box, text } : box
    );
    onTextBoxUpdate(updated);
  };

  const handleDeleteTextBox = (id: number) => {
    const updated = textBoxes.filter((box) => box.id !== id);
    onTextBoxUpdate(updated);
  };

  return (
    <div className="controls-panel">
      <div className="control-group">
        <label 
          htmlFor="image-upload" 
          className="upload-label" 
          style={{ cursor: 'pointer' }}
          onClick={handleUploadClick}
        >
          Upload Your Own Image
        </label>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="control-group">
        <button onClick={onAddTextBox} className="btn btn-primary">
          Add Text
        </button>
      </div>

      <div className="control-group">
        <label htmlFor="font-size">
          Font Size: <span id="font-size-value">{fontSize}</span>px
        </label>
        <input
          type="range"
          id="font-size"
          min="20"
          max="100"
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label htmlFor="text-color">Text Color</label>
        <input
          type="color"
          id="text-color"
          value={textColor}
          onChange={(e) => onTextColorChange(e.target.value)}
        />
      </div>

      <div className="control-group">
        <label htmlFor="font-family">Font Family</label>
        <select
          id="font-family"
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Impact">Impact</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Tahoma">Tahoma</option>
        </select>
      </div>

      <div className="text-boxes-container">
        <h3>Text Boxes</h3>
        <div id="text-boxes-list">
          {textBoxes.map((textBox, index) => (
            <div key={textBox.id} className="text-box-item">
              <div className="text-box-header">
                <span className="text-box-label">Text Box {index + 1}</span>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDeleteTextBox(textBox.id)}
                >
                  Delete
                </button>
              </div>
              <input
                type="text"
                value={textBox.text}
                onChange={(e) => handleTextBoxTextChange(textBox.id, e.target.value)}
                placeholder="Enter text..."
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

