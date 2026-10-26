// src/data/cloths.ts

export type WeaveType = 'plain' | 'twill' | 'herringbone' | 'pinstripe' | 'check' | 'flannel';
export type ClothGroup = 'Wool' | 'Tweed' | 'Linen' | 'Velvet';

export interface Cloth {
  id: string;
  name: string;
  mill: string;
  weight: string;
  composition: string;
  weave: WeaveType;
  group: ClothGroup;
  hex: string;
}

export const cloths: Cloth[] = [
  {
    id: 'c01',
    name: 'Harrowgate Charcoal',
    mill: 'Huddersfield',
    weight: '320 g',
    composition: '100% Super 130s Wool',
    weave: 'plain',
    group: 'Wool',
    hex: '#2B2D2F',
  },
  {
    id: 'c02',
    name: 'Savile Navy Twill',
    mill: 'Yorkshire',
    weight: '340 g',
    composition: '100% Worsted Wool',
    weave: 'twill',
    group: 'Wool',
    hex: '#1B2A44',
  },
  {
    id: 'c03',
    name: 'Braemar Herringbone',
    mill: 'Scotland',
    weight: '420 g',
    composition: '100% Cheviot Wool',
    weave: 'herringbone',
    group: 'Tweed',
    hex: '#4A3426',
  },
  {
    id: 'c04',
    name: 'Cavendish Chalk Stripe',
    mill: 'Huddersfield',
    weight: '330 g',
    composition: '100% Super 120s Wool',
    weave: 'pinstripe',
    group: 'Wool',
    hex: '#565E66',
  },
  {
    id: 'c05',
    name: 'Forestry Windowpane',
    mill: 'Yorkshire',
    weight: '280 g',
    composition: '95% Wool, 5% Silk',
    weave: 'check',
    group: 'Wool',
    hex: '#1F3A2E',
  },
  {
    id: 'c06',
    name: 'Oxblood Velvet',
    mill: 'Biella',
    weight: '390 g',
    composition: '100% Cotton Velvet',
    weave: 'plain',
    group: 'Velvet',
    hex: '#5C1A1F',
  },
  {
    id: 'c07',
    name: 'Highland Flannel',
    mill: 'Scotland',
    weight: '350 g',
    composition: '100% Shetland Wool',
    weave: 'flannel',
    group: 'Tweed',
    hex: '#6B6F73',
  },
  {
    id: 'c08',
    name: 'Camel Hopsack',
    mill: 'Huddersfield',
    weight: '300 g',
    composition: '80% Wool, 20% Camel Hair',
    weave: 'plain',
    group: 'Wool',
    hex: '#B08A5B',
  },
  {
    id: 'c09',
    name: 'Stone Irish Linen',
    mill: 'Belfast',
    weight: '260 g',
    composition: '100% Irish Linen',
    weave: 'plain',
    group: 'Linen',
    hex: '#BDB5A4',
  },
  {
    id: 'c10',
    name: 'Sage Hopsack Linen',
    mill: 'Belfast',
    weight: '240 g',
    composition: '60% Linen, 40% Cotton',
    weave: 'twill',
    group: 'Linen',
    hex: '#8C9A7F',
  },
  {
    id: 'c11',
    name: 'Midnight Barathea',
    mill: 'Biella',
    weight: '310 g',
    composition: '100% Merino Wool',
    weave: 'twill',
    group: 'Wool',
    hex: '#14213D',
  },
  {
    id: 'c12',
    name: 'Slate Melange',
    mill: 'Yorkshire',
    weight: '360 g',
    composition: '100% Super 110s Wool',
    weave: 'herringbone',
    group: 'Tweed',
    hex: '#55623F',
  },
];

export const clothGroups: Array<'All' | ClothGroup> = ['All', 'Wool', 'Tweed', 'Linen', 'Velvet'];
