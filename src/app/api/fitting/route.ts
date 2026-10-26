import { NextResponse } from 'next/server';
import { stores, timeSlots } from '@/data/booking';

/* ── In-memory rate limit: 5 req/min per IP ──────────────────────────────── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT   = 5;
const WINDOW_MS    = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

/* ── Validation helpers ──────────────────────────────────────────────────── */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^\+?[\d\s\-]{7,15}$/;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

interface BookingPayload {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  store?: unknown;
  date?: unknown;
  time?: unknown;
  suit?: unknown;
  occasion?: unknown;
  notes?: unknown;
  website?: unknown;
  submittedAt?: unknown;
}

/* ── Ref generator ───────────────────────────────────────────────────────── */
function makeRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'HR-';
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

/* ── POST handler ────────────────────────────────────────────────────────── */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false, errors: { _: 'Too many requests. Please wait a minute.' } }, { status: 429 });
    }

    // Parse body
    let body: BookingPayload;
    try {
      body = await req.json() as BookingPayload;
    } catch {
      return NextResponse.json({ ok: false, errors: { _: 'Invalid request body.' } }, { status: 400 });
    }

    // Honeypot: silently succeed
    if (body.website && String(body.website).length > 0) {
      return NextResponse.json({ ok: true, ref: 'HR-000000' });
    }

    // Server-side validation
    const errors: Record<string, string> = {};

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length < 2) errors.name = 'Full name is required (min 2 characters).';

    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    if (!phoneRe.test(phone)) errors.phone = 'Valid phone number required (7–15 digits).';

    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!emailRe.test(email)) errors.email = 'Valid email address required.';

    const storeId = typeof body.store === 'string' ? body.store : '';
    if (!stores.find((s) => s.id === storeId)) errors.store = 'Please select a valid store.';

    const date = typeof body.date === 'string' ? body.date : '';
    if (!date) {
      errors.date = 'Date is required.';
    } else if (date < todayStr()) {
      errors.date = 'Date must be today or in the future.';
    }

    const time = typeof body.time === 'string' ? body.time : '';
    if (!timeSlots.includes(time)) errors.time = 'Please select a valid time slot.';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    // Generate reference and log booking (TODO: replace with email service or database)
    const ref = makeRef();
    const storeName = stores.find((s) => s.id === storeId)?.name ?? storeId;
    console.log('[Halden & Rowe] New fitting request:', {
      ref,
      name,
      email,
      phone,
      store: storeName,
      date,
      time,
      suit: body.suit ?? '',
      occasion: body.occasion ?? '',
      notes: body.notes ?? '',
      submittedAt: body.submittedAt ?? new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, ref });
  } catch (err) {
    console.error('[/api/fitting] Unexpected error:', err);
    return NextResponse.json({ ok: false, errors: { _: 'Internal server error.' } }, { status: 500 });
  }
}
