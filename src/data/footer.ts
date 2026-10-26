// src/data/footer.ts

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterAddress {
  name: string;
  lines: string[];
}

export interface FooterData {
  tagline: string;
  columns: FooterColumn[];
  address: FooterAddress;
  hours: string[];
  phone: string;
  email: string;
  socials: FooterLink[];
}

export const footerData: FooterData = {
  tagline: 'Bespoke Tailors, Est. 1927',
  columns: [
    {
      title: 'Explore',
      links: [
        { label: 'The Collection', href: '/collection' },
        { label: 'Cloth Library', href: '#cloth' },
        { label: 'The Atelier', href: '#atelier' },
        { label: 'Book a Fitting', href: '#book' },
      ],
    },
    {
      title: 'The House',
      links: [
        { label: 'Our Heritage', href: '#heritage' },
        { label: 'The Cutters', href: '#heritage' },
        { label: 'Client Stories', href: '#clients' },
        { label: 'Contact', href: '#book' },
      ],
    },
  ],
  address: {
    name: 'Halden & Rowe',
    lines: ['14 Mount Street', 'Mayfair, London', 'W1K 3NB'],
  },
  hours: [
    'Mon – Fri  09:00 – 18:00',
    'Sat  10:00 – 16:00',
  ],
  phone: '+44 20 7495 0000',
  email: 'appointments@haldenandrowe.co.uk',
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'Pinterest', href: '#' },
    { label: 'LinkedIn', href: '#' },
  ],
};
