// src/data/booking.ts

export interface Store {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
}

export const stores: Store[] = [
  {
    id: 'mayfair',
    name: 'Mayfair',
    address: '14 Mount Street, London W1K 3NB',
    hours: 'Mon – Fri 09:00 – 18:00 · Sat 10:00 – 16:00',
    phone: '+44 20 7495 0000',
  },
  {
    id: 'city',
    name: 'The City',
    address: '3 Threadneedle Walk, London EC2R 8AY',
    hours: 'Mon – Fri 08:00 – 18:30',
    phone: '+44 20 7626 0000',
  },
  {
    id: 'edinburgh',
    name: 'Edinburgh',
    address: '22 George Street, Edinburgh EH2 2PF',
    hours: 'Mon – Sat 09:30 – 17:30',
    phone: '+44 131 225 0000',
  },
];

export const timeSlots: string[] = [
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
];

export const occasions: string[] = [
  'Wedding',
  'Business',
  'Black tie',
  'Everyday',
  'Other',
];

export const bookingNote =
  'No obligation. Ninety minutes. Single malt included.';

export interface Reassurance {
  value: string;
  label: string;
}

export const reassurance: Reassurance[] = [
  { value: '90', label: 'Minutes' },
  { value: '0',  label: 'Obligation' },
  { value: '1',  label: 'Single malt' },
];

