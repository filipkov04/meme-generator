'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';

interface UpvoteButtonProps {
  memeId: string;
  initialCount: number;
}

export default function UpvoteButton({ memeId, initialCount }: UpvoteButtonProps) {
  const auth = db.useAuth();
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(initialCount);

  // Query to check if user has upvoted this meme and get count
  const { data } = db.useQuery({
    upvotes: {
      $: {
        where: {
          memeId,
        },
      },
    },
  });

  useEffect(() => {
    if (data?.upvotes) {
      setUpvoteCount(data.upvotes.length);
      if (auth?.user) {
        const userId = auth.user.id;
        const hasUpvoted = data.upvotes.some(
          (u: any) => u.userId === userId
        );
        setUpvoted(hasUpvoted);
      }
    }
  }, [data, auth?.user]);

  const handleUpvote = async () => {
    if (!auth?.user) {
      alert('Please log in to upvote memes');
      return;
    }

    const userId = auth.user.id;

    try {
      if (upvoted) {
        // Remove upvote
        const existingUpvote = data?.upvotes?.find(
          (u: any) => u.memeId === memeId && u.userId === userId
        );
        if (existingUpvote) {
          await db.transact(db.tx.upvotes[existingUpvote.id].delete());
        }
      } else {
        // Add upvote
        const upvoteId = await db.getLocalId('upvote');
        await db.transact(
          db.tx.upvotes[upvoteId].update({
            memeId,
            userId: userId,
            createdAt: Date.now(),
          })
        );
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      alert('Failed to upvote. Please try again.');
    }
  };

  return (
    <button
      className={`upvote-button ${upvoted ? 'upvoted' : ''}`}
      onClick={handleUpvote}
    >
      <span>▲</span>
      <span className="upvote-count">{upvoteCount}</span>
    </button>
  );
}

