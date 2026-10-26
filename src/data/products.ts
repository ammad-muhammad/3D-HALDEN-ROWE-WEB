export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export const categories = [
  'Three-piece',
  'Two-piece',
  'Double-breasted',
  'Dinner',
  'Summer',
] as const;

export type ProductCategory = (typeof categories)[number];

export interface ProductDetails {
  fabric: string;
  weight: string;
  lining: string;
  fit: string;
  buttons: string;
  origin: string;
  leadTime: string;
}

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  tagline: string;
  description: string;
  details: ProductDetails;
  colors: ProductColor[];
  featured: boolean;
  // Optional convenience fields
  subtitle?: string;
  cut?: string;
  lapel?: string;
  fabric?: string;
}

export const COLOR_HEX: Record<string, { name: string; hex: string }> = {
  charcoal: { name: 'Charcoal', hex: '#2B2D2F' },
  navy:     { name: 'Navy',     hex: '#1B2A44' },
  forest:   { name: 'Forest',   hex: '#1F3A2E' },
  camel:    { name: 'Camel',    hex: '#B08A5B' },
  slate:    { name: 'Slate',    hex: '#565E66' },
  oxblood:  { name: 'Oxblood',  hex: '#5C1A1F' },
  black:    { name: 'Black',    hex: '#121212' },
  midnight: { name: 'Midnight', hex: '#14213D' },
  grey:     { name: 'Grey',     hex: '#6B6F73' },
  tan:      { name: 'Tan',      hex: '#A98B6A' },
  olive:    { name: 'Olive',    hex: '#5B5E3A' },
  brown:    { name: 'Brown',    hex: '#4A3426' },
  moss:     { name: 'Moss',     hex: '#55623F' },
  stone:    { name: 'Stone',    hex: '#BDB5A4' },
  sand:     { name: 'Sand',     hex: '#CDB892' },
  sage:     { name: 'Sage',     hex: '#8C9A7F' },
  taupe:    { name: 'Taupe',    hex: '#8B7D6F' },
  mist:     { name: 'Mist',     hex: '#9AA7B0' },
};

function makeColors(ids: string[]): ProductColor[] {
  return ids.map((id) => {
    const entry = COLOR_HEX[id];
    const name = entry ? entry.name : id.charAt(0).toUpperCase() + id.slice(1);
    const hex = entry ? entry.hex : '#000000';
    return { id, name, hex };
  });
}

export const products: Product[] = [
  // ── Featured six — shown on home, the-mayfair at index 1 (centre card) ──
  {
    slug: 'the-savile',
    name: 'The Savile',
    category: 'Double-breasted',
    price: 2850,
    featured: true,
    tagline: 'A commanding 6x2 double-breasted cut with striking chalk pinstripes.',
    description:
      'The Savile embodies pure tailoring heritage with an imposing broad chest wrap and sweeping lapels that extend to the shoulder seam. Woven with subtle pinstripes that sharpen the vertical line effortlessly.',
    subtitle: 'Double-Breasted Six-Button',
    cut: 'Double-Breasted 6x2',
    lapel: 'Wide Peak Lapel',
    fabric: 'Worsted Wool Pinstripe',
    details: {
      fabric: 'Worsted Wool Pinstripe',
      weight: '360gsm Autumn Weight',
      lining: 'Bespoke Silk-Blend Jacquard',
      fit: 'Draped Double-Breasted 6x2',
      buttons: 'Matte Horn with Waxed Thread',
      origin: 'Leeds, West Yorkshire',
      leadTime: '7 to 9 weeks',
    },
    colors: makeColors(['navy', 'charcoal', 'oxblood', 'slate']),
  },
  {
    // INDEX 1 — landing card for the atelier suit flight
    slug: 'the-mayfair',
    name: 'The Mayfair',
    category: 'Three-piece',
    price: 2450,
    featured: true,
    tagline: 'The definitive London three-piece with broad peak lapels and watch chain.',
    description:
      'Cut from heavy English worsted wool, The Mayfair commands presence with an architectural roped sleevehead and structured chest canvas. The high-gorge waistcoat is fitted with a traditional loop for an antique pocket watch.',
    subtitle: 'Single-Breasted Three-Piece',
    cut: 'Single-Breasted Three-Piece',
    lapel: 'Peak Lapel',
    fabric: 'Super 150s English Worsted Wool',
    details: {
      fabric: 'Super 150s English Worsted Wool',
      weight: '340gsm Four-Season',
      lining: 'Full Cupro Heritage Twill',
      fit: 'Structured Savile Row Cut',
      buttons: 'Hand-Carved Buffalo Horn',
      origin: 'Huddersfield, Yorkshire',
      leadTime: '6 to 8 weeks',
    },
    colors: makeColors(['charcoal', 'navy', 'forest', 'camel']),
  },
  {
    slug: 'the-belgravia',
    name: 'The Belgravia',
    category: 'Dinner',
    price: 3200,
    featured: true,
    tagline: 'Evening black tie tailored with a continuous silk satin shawl collar.',
    description:
      'Crafted for ceremonial gala evenings, The Belgravia pairs deep barathea wool with pure silk satin facings along the continuous collar and welted pockets. A single hand-covered evening button provides an immaculate closure.',
    subtitle: 'Single-Breasted Dinner Suit',
    cut: 'One-Button Evening Dinner Suit',
    lapel: 'Satin Shawl Collar',
    fabric: 'Barathea Wool & Pure Silk Satin',
    details: {
      fabric: 'Midnight Barathea Wool & Silk',
      weight: '310gsm Formal Weight',
      lining: 'Pure Black Silk Habotai',
      fit: 'Contoured Evening Silhouette',
      buttons: 'Hand-Covered Barathea Silk',
      origin: 'Biella, Northern Italy',
      leadTime: '8 to 10 weeks',
    },
    colors: makeColors(['black', 'midnight', 'charcoal', 'oxblood']),
  },
  {
    slug: 'the-kensington',
    name: 'The Kensington',
    category: 'Two-piece',
    price: 1950,
    featured: true,
    tagline: 'Subtle windowpane check cut with soft shoulders for weekday ease.',
    description:
      'A relaxed yet refined two-piece tailored with gentle natural shoulders and clean straight flapped waist pockets. The micro windowpane check offers subtle geometric intrigue in natural daylight.',
    subtitle: 'Single-Breasted Two-Button',
    cut: 'Single-Breasted Two-Piece',
    lapel: 'Notch Lapel',
    fabric: 'Windowpane Check Wool & Silk',
    details: {
      fabric: 'Wool & Mulberry Silk Blend',
      weight: '280gsm Mid-Season',
      lining: 'Half-Lined Breathable Viscose',
      fit: 'Natural Shoulder Modern English',
      buttons: 'Smoke Mother-of-Pearl',
      origin: 'Bradford, West Yorkshire',
      leadTime: '5 to 7 weeks',
    },
    colors: makeColors(['grey', 'navy', 'olive', 'tan']),
  },
  {
    slug: 'the-piccadilly',
    name: 'The Piccadilly',
    category: 'Three-piece',
    price: 2650,
    featured: true,
    tagline: 'Heavyweight estate tweed cut into an imposing three-piece silhouette.',
    description:
      'Rooted in British sporting tradition, The Piccadilly is cut from dense herringbone tweed with reinforced pocket flaps and a classic five-button waistcoat. Durable enough for countryside terrain yet refined for town.',
    subtitle: 'Three-Piece Herringbone Tweed',
    cut: 'Three-Piece Sporting Suit',
    lapel: 'Notch Lapel',
    fabric: 'Yorkshire Herringbone Tweed',
    details: {
      fabric: 'Pure Cheviot Wool Tweed',
      weight: '420gsm Heavy Winter',
      lining: 'Olive Cupro with Heritage Crest',
      fit: 'Traditional Country Bespoke',
      buttons: 'Braided Leather Shanked Buttons',
      origin: 'Hawick, Scottish Borders',
      leadTime: '7 to 9 weeks',
    },
    colors: makeColors(['brown', 'charcoal', 'olive', 'grey']),
  },
  {
    slug: 'the-marylebone',
    name: 'The Marylebone',
    category: 'Summer',
    price: 1750,
    featured: true,
    tagline: 'Unstructured summer tailoring crafted from pure slubbed Irish linen.',
    description:
      'Completely unlined through the body, The Marylebone drapes with nonchalant Mediterranean ease and breathability. Generous patch pockets and soft pick stitching frame an open spread collar impeccably.',
    subtitle: 'Unstructured Summer Linen',
    cut: 'Unstructured Two-Piece',
    lapel: 'Soft Notch Lapel',
    fabric: 'Pure Irish Linen',
    details: {
      fabric: '100% Slubbed Irish Linen',
      weight: '260gsm Tropical Summer',
      lining: 'Unlined with Bound Seams',
      fit: 'Soft Neapolitan Shirt Shoulder',
      buttons: 'Natural Corozo Nut',
      origin: 'Belfast, Northern Ireland',
      leadTime: '4 to 6 weeks',
    },
    colors: makeColors(['stone', 'sand', 'sage']),
  },

  // ── Non-featured six — appear only on /collection ──────────────────────
  {
    slug: 'the-holborn',
    name: 'The Holborn',
    category: 'Three-piece',
    price: 2250,
    featured: false,
    tagline: 'Understated corporate authority in flannel wool chalk stripe.',
    description:
      'The Holborn delivers quiet assurance with soft-finish flannel and clean chalk stripes traced across the jacket and vest. Notch lapels on both garments maintain an approachable, executive silhouette.',
    subtitle: 'Three-Piece Chalk Stripe',
    cut: 'Three-Piece Business Suit',
    lapel: 'Notch Lapel',
    fabric: 'Flannel Wool Chalk Stripe',
    details: {
      fabric: 'Super 130s Flannel Wool',
      weight: '330gsm Autumn/Winter',
      lining: 'Midnight Navy Bemberg Cupro',
      fit: 'Classic British Flannel Cut',
      buttons: 'Dark Polished Horn',
      origin: 'Huddersfield, Yorkshire',
      leadTime: '6 to 8 weeks',
    },
    colors: makeColors(['charcoal', 'navy', 'olive']),
  },
  {
    slug: 'the-chelsea',
    name: 'The Chelsea',
    category: 'Double-breasted',
    price: 2950,
    featured: false,
    tagline: 'Minimalist double-breasted tailored with a clean 4x2 button stance.',
    description:
      'A streamlined double-breasted garment stripped of excessive ornamentation to celebrate pure cut and line. Tailored in matte plain cloth with straight jetted pockets and a suppressed waistline.',
    subtitle: 'Double-Breasted Four-Button',
    cut: 'Double-Breasted 4x2 Two-Piece',
    lapel: 'Slim Peak Lapel',
    fabric: 'Matte Plain Wool Weave',
    details: {
      fabric: 'Matte High-Twist Wool Crepe',
      weight: '300gsm Year-Round',
      lining: 'Tone-on-Tone Satin Twill',
      fit: 'Trim Modern Double-Breasted',
      buttons: 'Engraved Matte Resin',
      origin: 'Biella, Northern Italy',
      leadTime: '6 to 8 weeks',
    },
    colors: makeColors(['navy', 'black']),
  },
  {
    slug: 'the-soho',
    name: 'The Soho',
    category: 'Two-piece',
    price: 2100,
    featured: false,
    tagline: 'A slim, modern cut designed to be worn over fine-gauge knitwear.',
    description:
      'Conceived for contemporary urban evenings, The Soho replaces stiff canvas with a featherlight half-canvassed construction. Soft rounded patch pockets complement crewnecks and rollneck knits seamlessly.',
    subtitle: 'Slim Two-Piece Casual Suit',
    cut: 'Slim Two-Piece',
    lapel: 'Notch Lapel',
    fabric: 'Lightweight Wool Crepe',
    details: {
      fabric: 'Crepe Weave Worsted Wool',
      weight: '270gsm Lightweight',
      lining: 'Quarter Butterfly Lining',
      fit: 'Slim Tapered Cut',
      buttons: 'Burnt Edge Horn',
      origin: 'Prato, Tuscany',
      leadTime: '5 to 7 weeks',
    },
    colors: makeColors(['olive']),
  },
  {
    slug: 'the-regent',
    name: 'The Regent',
    category: 'Dinner',
    price: 3400,
    featured: false,
    tagline: 'Opulent evening wear crafted from deep-pile jewel-toned velvet.',
    description:
      'An exquisite evening jacket tailored in plush Italian cotton velvet that catches the low light of dining rooms. Broad silk grosgrain peak lapels and covered buttons complete this heirloom dinner garment.',
    subtitle: 'Velvet Smoking & Dinner Jacket',
    cut: 'Single-Button Velvet Dinner Jacket',
    lapel: 'Silk Peak Lapel',
    fabric: 'Pure Cotton Velvet',
    details: {
      fabric: 'Italian Deep-Pile Cotton Velvet',
      weight: '390gsm Evening Weight',
      lining: 'Burgundy Pure Silk Satin',
      fit: 'Contoured Black-Tie Jacket',
      buttons: 'Hand-Covered Silk Grosgrain',
      origin: 'Como, Lombardy',
      leadTime: '8 to 10 weeks',
    },
    colors: makeColors(['forest', 'oxblood', 'midnight', 'black']),
  },
  {
    slug: 'the-hampstead',
    name: 'The Hampstead',
    category: 'Summer',
    price: 2350,
    featured: false,
    tagline: 'Breezy warm-weather tailoring in a balanced cotton-linen blend.',
    description:
      'Engineered for warm garden gatherings, The Hampstead combines the crisp drape of linen with the soft resilience of cotton. Finished with an open neckline and airy unlined sleeves.',
    subtitle: 'Lightweight Cotton-Linen Two-Piece',
    cut: 'Two-Button Unstructured Two-Piece',
    lapel: 'Notch Lapel',
    fabric: 'Crisp Cotton-Linen Blend',
    details: {
      fabric: '60% Irish Linen, 40% Egyptian Cotton',
      weight: '250gsm Airy Summer',
      lining: 'Unlined Body & Sleeves',
      fit: 'Relaxed Summer Tailoring',
      buttons: 'Blonde Horn',
      origin: 'Dublin, Ireland',
      leadTime: '4 to 6 weeks',
    },
    colors: makeColors(['stone', 'sand', 'sage', 'mist']),
  },
  {
    slug: 'the-strand',
    name: 'The Strand',
    category: 'Three-piece',
    price: 2750,
    featured: false,
    tagline: 'Three-piece tailoring elevated with hand-carved blonde horn buttons.',
    description:
      'The Strand showcases distinctive blonde contrast buttons set against rich high-twist English wool. A sharp sweeping peak lapel and tailored five-button waistcoat deliver a distinguished heritage profile.',
    subtitle: 'Three-Piece with Contrast Horn Buttons',
    cut: 'Single-Breasted Three-Piece',
    lapel: 'Peak Lapel',
    fabric: 'Twist Wool High-Twist Weave',
    details: {
      fabric: 'High-Twist English Fresco Wool',
      weight: '320gsm Crease-Resistant',
      lining: 'Full Cupro Satin',
      fit: 'Structured English Three-Piece',
      buttons: 'Blonde Hand-Carved Horn',
      origin: 'Huddersfield, Yorkshire',
      leadTime: '6 to 8 weeks',
    },
    colors: makeColors(['forest', 'navy', 'tan', 'charcoal']),
  },
];



export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function imageSrc(
  product: Product | { slug: string },
  colorId: string
): string {
  return `/images/products/${product.slug}/${colorId}.png`;
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(n);
}
