'use client';

import Link from 'next/link';
import { db } from '@/lib/db';

export default function Navbar() {
  const auth = db.useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span>import brothers</span>
      </div>
      <div className="nav-links">
        <Link href="/create">Create Meme</Link>
        <Link href="/browse">Browse Memes</Link>
        {auth?.user && <Link href="/profile">Profile</Link>}
      </div>
      {auth?.user ? (
        <button onClick={() => db.auth.signOut()} className="nav-cta">
          Logout
        </button>
      ) : (
        <Link href="/auth" className="nav-cta">
          Login
        </Link>
      )}
    </nav>
  );
}

