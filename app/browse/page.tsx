'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import MemeCard from '@/components/meme/MemeCard';

export default function BrowsePage() {
  const auth = db.useAuth();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes'>('newest');

  // Query all memes
  const { data, isLoading, error } = db.useQuery({
    memes: {},
  });

  useEffect(() => {
    if (!auth?.user) {
      router.push('/auth');
    }
  }, [auth?.user, router]);

  if (isLoading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading memes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p className="error-message">Error loading memes. Please try again.</p>
        </div>
      </div>
    );
  }

  let memes = data?.memes || [];
  
  // Sort memes
  if (sortBy === 'newest') {
    memes = [...memes].sort((a, b) => b.createdAt - a.createdAt);
  } else {
    memes = [...memes].sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
  }

  // Get user emails for creators
  const userIds = [...new Set(memes.map((m) => m.createdBy))];
  const { data: usersData } = db.useQuery({
    users: {},
  });

  const userMap = new Map();
  if (usersData?.users) {
    usersData.users
      .filter((u: any) => userIds.includes(u.id))
      .forEach((u: any) => {
        userMap.set(u.id, u.email || u.id);
      });
  }

  return (
    <div className="container">
      <header>
        <h1>Browse Memes</h1>
        <p>Discover and upvote the best memes from the community</p>
      </header>

      <div style={{ padding: '0 40px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label style={{ color: 'var(--text-secondary)' }}>Sort by:</label>
        <button
          onClick={() => setSortBy('newest')}
          className={`btn ${sortBy === 'newest' ? 'btn-primary' : ''}`}
          style={{ background: sortBy === 'newest' ? 'var(--primary-color)' : 'transparent', border: '1px solid var(--border-color)' }}
        >
          Newest
        </button>
        <button
          onClick={() => setSortBy('upvotes')}
          className={`btn ${sortBy === 'upvotes' ? 'btn-primary' : ''}`}
          style={{ background: sortBy === 'upvotes' ? 'var(--primary-color)' : 'transparent', border: '1px solid var(--border-color)' }}
        >
          Most Upvoted
        </button>
      </div>

      {memes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            No memes yet. Be the first to create one!
          </p>
        </div>
      ) : (
        <div className="meme-grid">
          {memes.map((meme) => (
            <MemeCard
              key={meme.id}
              meme={meme}
              creatorEmail={userMap.get(meme.createdBy)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

