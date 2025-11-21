'use client';

import UpvoteButton from './UpvoteButton';

interface MemeCardProps {
  meme: {
    id: string;
    imageData?: string;
    createdAt?: number;
    createdBy?: string;
    upvoteCount?: number;
    [key: string]: any;
  };
  creatorEmail?: string;
}

export default function MemeCard({ meme, creatorEmail }: MemeCardProps) {
  const date = new Date(meme.createdAt || Date.now());
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="meme-card">
      <img src={meme.imageData || ''} alt="Meme" />
      <div className="meme-card-info">
        <div className="meme-card-header">
          <div className="meme-card-meta">
            <div>Posted by {creatorEmail || 'Unknown'}</div>
            <div>{formattedDate}</div>
          </div>
          <UpvoteButton memeId={meme.id} initialCount={meme.upvoteCount || 0} />
        </div>
      </div>
    </div>
  );
}

