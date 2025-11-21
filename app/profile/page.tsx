'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import MemeCard from '@/components/meme/MemeCard';
import Link from 'next/link';

export default function ProfilePage() {
  const auth = db.useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'memes' | 'upvoted'>('memes');

  // Query all memes
  const { data: memesData } = db.useQuery({
    memes: {},
  });

  // Query all upvotes to calculate stats
  const { data: upvotesData } = db.useQuery({
    upvotes: {},
  });

  // Query users to get emails
  const { data: usersData } = db.useQuery({
    users: {},
  });

  useEffect(() => {
    if (!auth?.user) {
      router.push('/auth');
    }
  }, [auth?.user, router]);

  if (!auth?.user) {
    return null;
  }

  const user = auth.user;
  const allMemes = memesData?.memes || [];
  const allUpvotes = upvotesData?.upvotes || [];
  const allUsers = usersData?.users || [];

  // Create user map for emails
  const userMap = new Map();
  allUsers.forEach((u: any) => {
    userMap.set(u.id, u.email || u.id);
  });

  // Filter user's memes
  const userMemes = allMemes.filter((meme: any) => meme.createdBy === user.id);
  
  // Calculate total upvotes received
  const totalUpvotesReceived = userMemes.reduce((total: number, meme: any) => {
    const memeUpvotes = allUpvotes.filter((u: any) => u.memeId === meme.id);
    return total + memeUpvotes.length;
  }, 0);

  // Get user's upvoted memes
  const userUpvotes = allUpvotes.filter((u: any) => u.userId === user.id);
  const upvotedMemeIds = userUpvotes.map((u: any) => u.memeId);
  const upvotedMemes = allMemes.filter((meme: any) => upvotedMemeIds.includes(meme.id));

  // Calculate average upvotes per meme
  const avgUpvotes = userMemes.length > 0 
    ? (totalUpvotesReceived / userMemes.length).toFixed(1) 
    : '0';

  // Get most upvoted meme
  const mostUpvotedMeme = userMemes.length > 0
    ? userMemes.reduce((max: any, meme: any) => {
        const memeUpvotes = allUpvotes.filter((u: any) => u.memeId === meme.id);
        const maxUpvotes = allUpvotes.filter((u: any) => u.memeId === max.id);
        return memeUpvotes.length > maxUpvotes.length ? meme : max;
      }, userMemes[0])
    : null;

  const mostUpvotedCount = mostUpvotedMeme
    ? allUpvotes.filter((u: any) => u.memeId === mostUpvotedMeme.id).length
    : 0;

  return (
    <div className="container">
      <header>
        <h1>Your Profile</h1>
        <p>View your memes, stats, and activity</p>
      </header>

      {/* Profile Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
        padding: '0 40px'
      }}>
        <div className="stat-card" style={{
          background: 'var(--card-bg)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '8px' }}>
            {userMemes.length}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Memes Created
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'var(--card-bg)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '8px' }}>
            {totalUpvotesReceived}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Total Upvotes Received
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'var(--card-bg)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '8px' }}>
            {avgUpvotes}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Avg Upvotes/Meme
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'var(--card-bg)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '8px' }}>
            {userUpvotes.filter((u: any) => u.userId === user.id).length}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Memes You Upvoted
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div style={{
        background: 'var(--card-bg)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '40px',
        margin: '0 40px 40px'
      }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>Account Information</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email:</span>
            <span style={{ marginLeft: '12px', color: 'var(--text-color)' }}>{user.email || 'Not available'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>User ID:</span>
            <span style={{ marginLeft: '12px', color: 'var(--text-color)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {user.id}
            </span>
          </div>
          {mostUpvotedMeme && (
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Most Upvoted Meme:</span>
              <span style={{ marginLeft: '12px', color: 'var(--text-color)' }}>
                {mostUpvotedCount} upvotes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 40px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('memes')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'memes' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === 'memes' ? 'var(--primary-color)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === 'memes' ? '600' : '400',
              fontSize: '1rem'
            }}
          >
            My Memes ({userMemes.length})
          </button>
          <button
            onClick={() => setActiveTab('upvoted')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'upvoted' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === 'upvoted' ? 'var(--primary-color)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === 'upvoted' ? '600' : '400',
              fontSize: '1rem'
            }}
          >
            Upvoted Memes ({upvotedMemes.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'memes' ? (
        <div>
          {userMemes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>No memes yet!</p>
              <Link href="/create" className="btn btn-primary">
                Create Your First Meme
              </Link>
            </div>
          ) : (
            <div className="meme-grid">
              {userMemes
                .sort((a: any, b: any) => b.createdAt - a.createdAt)
                .map((meme: any) => {
                  const memeUpvotes = allUpvotes.filter((u: any) => u.memeId === meme.id);
                  return (
                    <MemeCard
                      key={meme.id}
                      meme={{
                        ...meme,
                        upvoteCount: memeUpvotes.length,
                      }}
                      creatorEmail={user.email}
                    />
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        <div>
          {upvotedMemes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>No upvoted memes yet!</p>
              <Link href="/browse" className="btn btn-primary">
                Browse Memes
              </Link>
            </div>
          ) : (
            <div className="meme-grid">
              {upvotedMemes
                .sort((a: any, b: any) => {
                  const aUpvotes = allUpvotes.filter((u: any) => u.memeId === a.id).length;
                  const bUpvotes = allUpvotes.filter((u: any) => u.memeId === b.id).length;
                  return bUpvotes - aUpvotes;
                })
                .map((meme: any) => {
                  const memeUpvotes = allUpvotes.filter((u: any) => u.memeId === meme.id);
                  const creatorEmail = userMap.get(meme.createdBy) || 'Unknown';
                  
                  return (
                    <MemeCard
                      key={meme.id}
                      meme={{
                        ...meme,
                        upvoteCount: memeUpvotes.length,
                      }}
                      creatorEmail={creatorEmail}
                    />
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

