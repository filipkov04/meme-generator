'use client';

interface TemplateSelectorProps {
  onTemplateSelect: (imagePath: string) => void;
  activeTemplate: string | null;
}

const templateImages = [
  '/assets/Screenshot 2025-11-19 at 11.28.30 AM.png',
  '/assets/Screenshot 2025-11-19 at 11.32.43 AM.png',
  '/assets/Screenshot 2025-11-19 at 11.38.25 AM.png',
  '/assets/Screenshot 2025-11-19 at 11.43.04 AM.png',
  '/assets/Screenshot 2025-11-19 at 11.43.08 AM.png',
  '/assets/Screenshot 2025-11-19 at 11.46.36 AM.png',
  '/assets/Screenshot 2025-11-19 at 11.55.18 AM.png',
  '/assets/Screenshot 2025-11-19 at 12.48.47 PM.png',
  '/assets/Screenshot 2025-11-19 at 2.37.27 PM.png',
  '/assets/Screenshot 2025-11-19 at 2.37.30 PM.png',
  '/assets/Screenshot 2025-11-19 at 5.18.52 PM.png',
  '/assets/Screenshot 2025-11-19 at 5.20.29 PM.png',
];

export default function TemplateSelector({
  onTemplateSelect,
  activeTemplate,
}: TemplateSelectorProps) {
  return (
    <div className="templates-section">
      <h3>Template Images</h3>
      <div className="templates-grid">
        {templateImages.map((imagePath, index) => (
          <div
            key={index}
            className={`template-item ${
              activeTemplate === imagePath ? 'active' : ''
            }`}
            onClick={() => onTemplateSelect(imagePath)}
          >
            <img src={imagePath} alt={`Template ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

