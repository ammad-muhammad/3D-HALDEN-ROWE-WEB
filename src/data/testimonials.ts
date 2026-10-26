// src/data/testimonials.ts

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  suit: string;
  monogram: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote:
      'I have been measured on Savile Row, in Naples and in Hong Kong. Nothing has worn with the quiet authority of what came from this address. It is the only house I recommend.',
    name: 'Edward Pemberton',
    role: 'Barrister, Gray\'s Inn',
    suit: 'The Mayfair, Charcoal',
    monogram: 'EP',
  },
  {
    id: 't2',
    quote:
      'The lapels were exactly as I had drawn them in my notebook — I handed over the sketch half-expecting to be corrected. Three weeks later, there it was, cut to the millimetre.',
    name: 'Oliver Ashworth',
    role: 'Architect, London',
    suit: 'The Savile, Navy',
    monogram: 'OA',
  },
  {
    id: 't3',
    quote:
      'I ordered the dinner suit for a wedding and now it is the garment I reach for whenever I need to feel prepared for whatever the room demands.',
    name: 'Thomas Cavendish',
    role: 'Managing Director',
    suit: 'The Belgravia, Midnight',
    monogram: 'TC',
  },
  {
    id: 't4',
    quote:
      'My grandfather was a client. I inherited his ledger card when I turned forty. The house is unchanged — which is the highest praise I can offer any institution.',
    name: 'Charles Marlowe',
    role: 'Publisher, Mayfair',
    suit: 'The Holborn, Charcoal',
    monogram: 'CM',
  },
  {
    id: 't5',
    quote:
      'The linen suit travels without a crease, drapes without a fight, and arrives at the table before I do. I have worn it from London to Palermo and it has never looked anything less than immaculate.',
    name: 'James Fielding',
    role: 'Journalist & Author',
    suit: 'The Marylebone, Stone',
    monogram: 'JF',
  },
];
