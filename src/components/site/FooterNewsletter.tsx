'use client';

import { useRef, useState } from 'react';
import RevealText from '@/components/motion/RevealText';

const C = { ink: '#0B1410', brass: '#B08D57', cream: '#EDE4D3' } as const;
const F = { sans: 'var(--font-sans), Jost, sans-serif' } as const;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FooterNewsletter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRe.test(email.trim())) {
      setError('Please enter a valid email address.');
      inputRef.current?.focus();
      return;
    }
    setError('');
    setSuccess(true); // TODO: replace with real newsletter API call
  };

  return (
    <div>
      <RevealText
        text="Letters from the cutting room"
        as="h3"
        mode="words"
        style={{ fontFamily: 'var(--font-display),"Cormorant Garamond",Georgia,serif', fontSize: '1.5rem', color: C.cream, margin: '0 0 0.6rem 0', fontWeight: 400 }}
      />
      <p style={{ fontFamily: F.sans, fontWeight: 300, fontSize: '0.88rem', color: 'rgba(237,228,211,0.6)', margin: '0 0 1.2rem 0', lineHeight: 1.6 }}>
        Occasional notes on cloth, craft and the people who wear our suits.
      </p>
      {success ? (
        <p style={{ fontFamily: F.sans, fontSize: '0.9rem', color: C.brass }}>Thank you. You are on the list.</p>
      ) : (
        <form noValidate onSubmit={handleSubmit}>
          <style>{`.hr-ft-nl-input:focus{border-bottom-color:#B08D57!important;outline:none}.hr-ft-nl-sub:focus-visible{outline:2px solid #B08D57;outline-offset:3px}`}</style>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(237,228,211,0.22)', alignItems: 'center' }}>
            <input
              ref={inputRef} type="email" placeholder="your@email.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              aria-label="Email for newsletter" aria-invalid={!!error}
              className="hr-ft-nl-input"
              style={{ background: 'transparent', border: 'none', color: C.cream, fontFamily: F.sans, fontSize: '0.92rem', padding: '0.6rem 0', flex: 1, outline: 'none' }}
            />
            <button type="submit" className="hr-ft-nl-sub" style={{ background: 'transparent', border: `1px solid ${C.brass}`, color: C.brass, fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.66rem', padding: '0.45rem 0.9rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Subscribe
            </button>
          </div>
          {error && <p role="alert" style={{ fontFamily: F.sans, fontSize: '0.76rem', color: '#D98A92', marginTop: '0.35rem', marginBottom: 0 }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
