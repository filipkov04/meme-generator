'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

export default function AuthPage() {
  const auth = db.useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicCodeSent, setMagicCodeSent] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (auth?.user) {
      router.push('/create');
    }
  }, [auth?.user, router]);


  const handleSendMagicCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    try {
      // Send magic code to email
      const result = await db.auth.sendMagicCode({ email });
      console.log('Magic code sent:', result);
      setMagicCodeSent(true);
      setError('');
    } catch (err: any) {
      console.error('Error sending magic code:', err);
      setError(err.message || 'Failed to send magic code. Please check your email configuration in InstantDB dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with magic code
      await db.auth.signInWithMagicCode({ email, code });
      router.push('/create');
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Welcome to Meme Generator</h2>
          <p>Create an account to get started</p>
        </div>


        {!magicCodeSent ? (
          <form onSubmit={handleSendMagicCode} className="auth-form active">
            <div className="form-group">
              <label htmlFor="auth-email">Email</label>
              <input
                type="email"
                id="auth-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Magic Code'}
            </button>
            <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              We'll send a code to your email to sign in
            </p>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Note: Check your spam folder. If no code arrives, verify email is configured in InstantDB dashboard.
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignInWithCode} className="auth-form active">
            <div className="form-group">
              <label htmlFor="auth-code">Enter Code</label>
              <input
                type="text"
                id="auth-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="Enter the code from your email"
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' }}
              />
              <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Code sent to {email}
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={async () => {
                  setError('');
                  setLoading(true);
                  try {
                    await db.auth.sendMagicCode({ email });
                    setError('');
                    alert('Code resent! Check your email.');
                  } catch (err: any) {
                    setError('Failed to resend code: ' + (err.message || 'Please try again'));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  padding: '8px',
                  borderRadius: '6px'
                }}
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setMagicCodeSent(false);
                  setCode('');
                  setError('');
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  padding: '8px',
                  borderRadius: '6px'
                }}
              >
                Change Email
              </button>
            </div>
            <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '0 20px' }}>
              ⚠️ If no code arrives, check spam folder or configure email in InstantDB dashboard
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

