// src/data/heritage.ts

export interface HeritageStat {
  value: number;
  suffix: string;
  label: string;
  countFrom: number;
}

export interface HeritageMilestone {
  year: string;
  title: string;
  text: string;
}

export interface HeritageData {
  label: string;
  title: string;
  intro: string;
  stats: HeritageStat[];
  milestones: HeritageMilestone[];
}

export const heritage: HeritageData = {
  label: '10 — The House',
  title: 'A century in the cutting room.',
  intro:
    'Since 1927 our cutters have worked from the same Mayfair address, passing their shears and their knowledge from one generation to the next. Every measurement is taken by hand, every canvas is pad-stitched in silence, and every suit leaves carrying the weight of that tradition.',
  stats: [
    {
      value: 1927,
      suffix: '',
      label: 'The year we first opened our doors',
      countFrom: 1800,
    },
    {
      value: 80,
      suffix: ' hrs',
      label: 'Of hand stitching in every suit',
      countFrom: 0,
    },
    {
      value: 3,
      suffix: '',
      label: 'Generations of cutters at one table',
      countFrom: 0,
    },
  ],
  milestones: [
    {
      year: '1927',
      title: 'The first fitting',
      text: 'Arthur Halden and Thomas Rowe take their first commission from a Mayfair solicitor who requires something cut for court — the ledger still sits on the shelf.',
    },
    {
      year: '1962',
      title: 'The cutting room moves',
      text: 'The second generation relocates the workroom to its current address and commissions a custom English oak cutting table that remains in daily use.',
    },
    {
      year: '1998',
      title: 'The third generation',
      text: 'James Halden-Rowe returns from Neapolitan training and introduces the soft-shoulder construction that now defines every house suit.',
    },
  ],
};
