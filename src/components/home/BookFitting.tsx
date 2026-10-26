'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stores, timeSlots, occasions, bookingNote, reassurance } from '@/data/booking';
import { products } from '@/data/products';
import { footerData } from '@/data/footer';
import { useLenis } from '@/lib/lenisContext';
import RevealText from '@/components/motion/RevealText';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const C = {
  ink:     '#0B1410',
  surface: '#14211B',
  brass:   '#B08D57',
  cream:   '#EDE4D3',
  error:   '#B4505A',
  errTxt:  '#D98A92',
} as const;

const F = {
  display: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
  sans:    'var(--font-sans), Jost, sans-serif',
} as const;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface FormState {
  name: string; phone: string; email: string;
  store: string; date: string; time: string;
  suit: string; occasion: string; notes: string;
  website: string;
}

interface FieldErrors {
  name?: string; phone?: string; email?: string;
  store?: string; date?: string; time?: string;
}

function validate(f: FormState): FieldErrors {
  const e: FieldErrors = {};
  if (!f.name || f.name.trim().length < 2) e.name = 'Full name required (min 2 chars).';
  if (!phoneRe.test(f.phone.trim()))       e.phone = 'Valid phone required (7–15 digits).';
  if (!emailRe.test(f.email.trim()))       e.email = 'Valid email required.';
  if (!stores.find((s) => s.id === f.store)) e.store = 'Please select a store.';
  if (!f.date)                             e.date = 'Date required.';
  else if (f.date < getTodayStr())         e.date = 'Date must be today or later.';
  if (!timeSlots.includes(f.time))         e.time = 'Please select a time.';
  return e;
}

/* ── Compact field wrapper ──────────────────────────────────────────────── */
function FW({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 0 }}>
      <label htmlFor={htmlFor} style={{ display: 'block', fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.64rem', color: error ? C.errTxt : C.brass, marginBottom: '0.35rem' }}>
        {label}
      </label>
      {children}
      {error && <p role="alert" style={{ fontFamily: F.sans, fontSize: '0.72rem', color: C.errTxt, marginTop: '0.25rem', marginBottom: 0 }}>{error}</p>}
    </div>
  );
}

const inp = (hasErr: boolean, extra?: React.CSSProperties): React.CSSProperties => ({
  background: 'transparent',
  borderBottom: `1px solid ${hasErr ? C.error : 'rgba(237,228,211,0.22)'}`,
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  color: C.cream, fontFamily: F.sans, fontSize: '0.95rem',
  padding: '0.6rem 0', width: '100%', outline: 'none', ...extra,
});

/* ── Success panel ──────────────────────────────────────────────────────── */
function SuccessPanel({ bookRef, store, date, time, onReset }: { bookRef: string; store: string; date: string; time: string; onReset: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
      <svg width="52" height="52" viewBox="0 0 56 56" fill="none" style={{ display: 'block', margin: '0 auto 1.3rem' }}>
        <circle cx="28" cy="28" r="26" stroke={C.brass} strokeWidth="1.5" />
        <polyline points="17,28 24,35 39,20" stroke={C.brass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 30, strokeDashoffset: 0, animation: 'hr-check-draw 0.6s ease forwards' }} />
      </svg>
      <style>{`@keyframes hr-check-draw{from{stroke-dashoffset:30}to{stroke-dashoffset:0}}`}</style>
      <h3 style={{ fontFamily: F.display, fontSize: '1.7rem', color: C.cream, margin: '0 0 0.5rem 0', fontWeight: 400 }}>Your fitting is requested.</h3>
      <p style={{ fontFamily: F.sans, fontWeight: 300, fontSize: '0.88rem', color: 'rgba(237,228,211,0.65)', marginBottom: '0.35rem' }}>
        Reference: <strong style={{ color: C.brass }}>{bookRef}</strong>
      </p>
      <p style={{ fontFamily: F.sans, fontWeight: 300, fontSize: '0.88rem', color: 'rgba(237,228,211,0.65)', marginBottom: '2rem' }}>
        {store} · {date} at {time}
      </p>
      <button onClick={onReset} style={{ background: 'transparent', border: 'none', color: C.brass, fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', cursor: 'pointer', borderBottom: `1px solid ${C.brass}`, paddingBottom: '2px' }}>
        Book another
      </button>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function BookFitting() {
  const lenis        = useLenis();
  const sectionRef   = useRef<HTMLElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const ariaRef      = useRef<HTMLDivElement>(null);

  const [form, setForm]     = useState<FormState>({ name: '', phone: '', email: '', store: stores[0].id, date: '', time: '', suit: '', occasion: '', notes: '', website: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState<{ ref: string; store: string; date: string; time: string } | null>(null);
  const [minDate, setMinDate] = useState<string>('');

  useEffect(() => {
    setMinDate(new Date().toISOString().slice(0, 10));
  }, []);

  /* ── hr:book event ──────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ suit?: string; cloth?: string }>).detail;
      setForm((f) => {
        let suit = f.suit;
        if (detail.suit) {
          const found = products.find((p) => p.slug === detail.suit || p.name.toLowerCase() === detail.suit!.toLowerCase());
          if (found) suit = found.slug;
        }
        let notes = f.notes;
        if (detail.cloth) {
          const prefix = `Cloth of interest: ${detail.cloth}`;
          notes = notes.startsWith(prefix) ? notes : prefix + (notes ? '\n' + notes : '');
        }
        return { ...f, suit, notes };
      });
      const el = document.getElementById('book');
      if (el) {
        if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 });
        else el.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('hr:book', handler);
    return () => window.removeEventListener('hr:book', handler);
  }, [lenis]);

  /* ── Entrance animations ────────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    const panel   = formPanelRef.current;
    if (!section || !panel) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduced) { gsap.set(['.hr-book-li', panel], { opacity: 1, y: 0 }); return; }

      gsap.fromTo('.hr-book-li',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 82%', once: true } }
      );
      gsap.fromTo(panel,
        { clipPath: 'inset(100% 0 0 0)', opacity: 1 },
        { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 78%', once: true },
          onComplete: () => {
            // Stagger fields in
            const fields = panel.querySelectorAll<HTMLElement>('.hr-book-field');
            gsap.fromTo(fields, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
          },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  const setField = (key: keyof FormState, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setApiError('');
  };

  const handleBlur = (key: keyof FieldErrors) => {
    const errs = validate(form);
    if (errs[key]) setErrors((e) => ({ ...e, [key]: errs[key] }));
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      document.getElementById(`book-${Object.keys(errs)[0]}`)?.focus();
      if (ariaRef.current) ariaRef.current.textContent = 'Please correct the errors below.';
      return;
    }
    setLoading(true); setApiError('');
    try {
      const res  = await fetch('/api/fitting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, submittedAt: new Date().toISOString() }) });
      const data = await res.json() as { ok: boolean; ref?: string };
      if (data.ok && data.ref) {
        setSuccess({ ref: data.ref, store: stores.find((s) => s.id === form.store)?.name ?? form.store, date: form.date, time: form.time });
      } else {
        setApiError(`Something went wrong. Please try again or call ${footerData.phone}.`);
      }
    } catch {
      setApiError(`Something went wrong. Please try again or call ${footerData.phone}.`);
    } finally { setLoading(false); }
  };

  const handleReset = useCallback(() => {
    setSuccess(null);
    setForm({ name: '', phone: '', email: '', store: stores[0].id, date: '', time: '', suit: '', occasion: '', notes: '', website: '' });
    setErrors({}); setApiError('');
  }, []);

  const chip = (active: boolean, small?: boolean): React.CSSProperties => ({
    fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.16em',
    fontSize: small ? '0.68rem' : '0.7rem',
    padding: small ? '0.35rem 0.7rem' : '0.4rem 0.85rem',
    border: `1px solid ${C.brass}`,
    background: active ? C.brass : 'transparent',
    color: active ? C.ink : C.cream,
    cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
  });

  return (
    <section
      id="book"
      ref={sectionRef}
      style={{ background: C.surface, paddingBlock: 'clamp(6rem,14svh,10rem)', paddingInline: '6vw', position: 'relative' }}
    >
      <style>{`
        .hr-book-grid {
          display: grid;
          grid-template-columns: minmax(0,0.9fr) minmax(0,1.1fr);
          gap: 5vw;
          max-width: 1300px;
          margin: 0 auto;
          align-items: start;
        }
        @media (max-width: 950px) {
          .hr-book-grid { grid-template-columns: 1fr; }
          .hr-book-left-sticky { position: static !important; }
        }
        .hr-book-input:focus  { border-bottom-color: #B08D57 !important; }
        .hr-book-select:focus { outline: none; border-bottom-color: #B08D57 !important; }
        .hr-book-textarea:focus { outline: none; border-bottom-color: #B08D57 !important; }
        .hr-book-chip:focus-visible { outline: 2px solid #B08D57; outline-offset: 3px; }
        .hr-book-submit:focus-visible { outline: 2px solid #B08D57; outline-offset: 3px; }
        .hr-book-store-card + .hr-book-store-card { border-top: 1px solid rgba(176,141,87,0.25); margin-top: 1.2rem; padding-top: 1.2rem; }
        .hr-book-store-card:hover .hr-store-name { transform: translateX(6px); color: #EDE4D3; }
        .hr-store-name { transition: transform 0.25s ease, color 0.25s ease; }
        .hr-book-inner-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 1.6rem;
        }
        @media (max-width: 600px) { .hr-book-inner-grid { grid-template-columns: 1fr; } }
        .hr-reassurance-row {
          display: flex;
          gap: 0;
          margin-top: 2rem;
          border-top: 1px solid rgba(176,141,87,0.15);
          padding-top: 1.5rem;
        }
        .hr-reassurance-item {
          flex: 1;
          text-align: center;
          padding: 0 1rem;
          border-right: 1px solid rgba(176,141,87,0.2);
        }
        .hr-reassurance-item:last-child { border-right: none; }
        .hr-reassurance-item:first-child { padding-left: 0; }
      `}</style>

      <div className="hr-book-grid">

        {/* LEFT — sticky */}
        <div
          className="hr-book-left-sticky"
          style={{ position: 'sticky', top: '7rem' }}
        >
          <span className="hr-book-li" style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.75rem', color: C.brass, display: 'block', marginBottom: '1rem' }}>
            13 — Private Fitting
          </span>
          <RevealText
            text="Begin with a conversation."
            as="h2"
            mode="words"
            className="hr-book-li"
            style={{ fontFamily: F.display, fontSize: 'clamp(2.2rem,4.5vw,4.5rem)', color: C.cream, lineHeight: 1.05, margin: '0 0 1.1rem 0', fontWeight: 400 }}
          />
          <p className="hr-book-li" style={{ fontFamily: F.sans, fontWeight: 300, fontSize: '1rem', lineHeight: 1.7, color: 'rgba(237,228,211,0.65)', maxWidth: '34rem', margin: '0 0 2.5rem 0' }}>
            Every commission begins with an unhurried conversation in one of our fitting rooms. There is no obligation and no hurry. Simply come and talk about the suit you have in mind.
          </p>

          {/* Stores */}
          <div className="hr-book-li">
            {stores.map((s) => (
              <div key={s.id} className="hr-book-store-card">
                <p className="hr-store-name" style={{ fontFamily: F.display, fontSize: '1.3rem', color: C.cream, margin: '0 0 0.3rem 0', fontWeight: 400 }}>{s.name}</p>
                <p style={{ fontFamily: F.sans, fontSize: '0.88rem', color: 'rgba(237,228,211,0.65)', margin: '0 0 0.3rem 0', lineHeight: 1.5 }}>{s.address}</p>
                <p style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.65rem', color: C.brass, margin: 0 }}>{s.hours}<br />{s.phone}</p>
              </div>
            ))}
          </div>

          {/* Note */}
          <p className="hr-book-li" style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: '1.5rem', color: 'rgba(237,228,211,0.45)', marginTop: '1.8rem', lineHeight: 1.3 }}>
            {bookingNote}
          </p>

          {/* Reassurance row */}
          <div className="hr-reassurance-row hr-book-li">
            {reassurance.map((r, i) => (
              <div key={i} className="hr-reassurance-item">
                <span style={{ fontFamily: F.display, fontSize: '2rem', color: C.brass, display: 'block', lineHeight: 1 }}>{r.value}</span>
                <span style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.65rem', color: 'rgba(237,228,211,0.5)', display: 'block', marginTop: '0.3rem' }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — form */}
        <div
          ref={formPanelRef}
          style={{ background: C.ink, border: '1px solid rgba(176,141,87,0.25)', padding: 'clamp(1.4rem,2.4vw,2.4rem)' }}
        >
          <div ref={ariaRef} aria-live="polite" style={{ position: 'absolute', left: '-9999px' }} />

          {success ? (
            <SuccessPanel bookRef={success.ref} store={success.store} date={success.date} time={success.time} onReset={handleReset} />
          ) : (
            <form noValidate onSubmit={handleSubmit}>
              {/* Honeypot */}
              <input name="website" value={form.website} onChange={(e) => setField('website', e.target.value)} tabIndex={-1} aria-hidden="true" autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} />

              {/* 2-col inner grid */}
              <div className="hr-book-inner-grid" style={{ marginBottom: '1rem' }}>
                <div className="hr-book-field">
                  <FW label="Full Name *" htmlFor="book-name" error={errors.name}>
                    <input id="book-name" className="hr-book-input" type="text" autoComplete="name" value={form.name} onChange={(e) => setField('name', e.target.value)} onBlur={() => handleBlur('name')} aria-invalid={!!errors.name} style={inp(!!errors.name)} />
                  </FW>
                </div>
                <div className="hr-book-field">
                  <FW label="Phone *" htmlFor="book-phone" error={errors.phone}>
                    <input id="book-phone" className="hr-book-input" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} onBlur={() => handleBlur('phone')} aria-invalid={!!errors.phone} style={inp(!!errors.phone)} />
                  </FW>
                </div>
                <div className="hr-book-field">
                  <FW label="Email *" htmlFor="book-email" error={errors.email}>
                    <input id="book-email" className="hr-book-input" type="email" autoComplete="email" value={form.email} onChange={(e) => setField('email', e.target.value)} onBlur={() => handleBlur('email')} aria-invalid={!!errors.email} style={inp(!!errors.email)} />
                  </FW>
                </div>
                <div className="hr-book-field">
                  <FW label="Preferred Store *" htmlFor="book-store" error={errors.store}>
                    <select id="book-store" className="hr-book-select" value={form.store} onChange={(e) => setField('store', e.target.value)} style={{ ...inp(!!errors.store), cursor: 'pointer' }}>
                      {stores.map((s) => <option key={s.id} value={s.id} style={{ background: C.ink }}>{s.name}</option>)}
                    </select>
                  </FW>
                </div>
                <div className="hr-book-field">
                  <FW label="Preferred Date *" htmlFor="book-date" error={errors.date}>
                    <input id="book-date" className="hr-book-input" type="date" min={minDate || undefined} value={form.date} onChange={(e) => setField('date', e.target.value)} onBlur={() => handleBlur('date')} aria-invalid={!!errors.date} style={{ ...inp(!!errors.date), colorScheme: 'dark' }} />
                  </FW>
                </div>
                <div className="hr-book-field">
                  <FW label="Suit of Interest" htmlFor="book-suit">
                    <select id="book-suit" className="hr-book-select" value={form.suit} onChange={(e) => setField('suit', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
                      <option value="" style={{ background: C.ink }}>Not sure yet</option>
                      {products.map((p) => <option key={p.slug} value={p.slug} style={{ background: C.ink }}>{p.name}</option>)}
                    </select>
                  </FW>
                </div>
              </div>

              {/* Time chips */}
              <div style={{ marginBottom: '1rem' }} className="hr-book-field">
                <p style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.64rem', color: errors.time ? C.errTxt : C.brass, margin: '0 0 0.4rem 0' }}>Preferred Time *</p>
                <div role="radiogroup" aria-label="Preferred time" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {timeSlots.map((t) => (
                    <button key={t} type="button" className="hr-book-chip" role="radio" aria-checked={form.time === t} onClick={() => setField('time', t)} style={chip(form.time === t)}>{t}</button>
                  ))}
                </div>
                {errors.time && <p style={{ fontFamily: F.sans, fontSize: '0.72rem', color: C.errTxt, marginTop: '0.25rem', marginBottom: 0 }}>{errors.time}</p>}
              </div>

              {/* Occasion chips */}
              <div style={{ marginBottom: '1rem' }} className="hr-book-field">
                <p style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.64rem', color: C.brass, margin: '0 0 0.4rem 0' }}>Occasion</p>
                <div role="radiogroup" aria-label="Occasion" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {occasions.map((o) => (
                    <button key={o} type="button" className="hr-book-chip" role="radio" aria-checked={form.occasion === o} onClick={() => setField('occasion', form.occasion === o ? '' : o)} style={chip(form.occasion === o, true)}>{o}</button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '1rem' }} className="hr-book-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label htmlFor="book-notes" style={{ fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.64rem', color: C.brass }}>Notes</label>
                  <span style={{ fontFamily: F.sans, fontSize: '0.68rem', color: 'rgba(237,228,211,0.3)' }}>{form.notes.length}/600</span>
                </div>
                <textarea id="book-notes" className="hr-book-textarea" rows={2} maxLength={600} value={form.notes} onChange={(e) => setField('notes', e.target.value)}
                  style={{ background: 'transparent', borderBottom: '1px solid rgba(237,228,211,0.22)', borderTop: 'none', borderLeft: 'none', borderRight: 'none', color: C.cream, fontFamily: F.sans, fontSize: '0.95rem', padding: '0.6rem 0', width: '100%', resize: 'vertical', minHeight: '4.5rem', outline: 'none' }}
                />
              </div>

              {apiError && <p role="alert" style={{ fontFamily: F.sans, fontSize: '0.82rem', color: C.errTxt, marginBottom: '1rem' }}>{apiError}</p>}

              <button
                type="submit" className="hr-book-submit" disabled={loading}
                style={{ background: C.brass, color: C.ink, border: '1px solid transparent', fontFamily: F.sans, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.78rem', width: '100%', height: '3.2rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.cream; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
              >
                {loading ? 'Sending…' : 'Request a Fitting'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
