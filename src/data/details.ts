/**
 * Copy for the Details Stage sections.
 * Edit this file to change any text without touching component logic.
 */

export interface DetailItem {
  title: string;
  text: string;
}

export interface DetailSection {
  label: string;
  title: string;
  body: string;
  items: [DetailItem, DetailItem, DetailItem];
}

export const detailsA: DetailSection = {
  label: '06 — The Cloth',
  title: 'Placeholder title for section A',
  body: 'Each length of cloth is chosen by hand, woven in the mills of Yorkshire and brought to London to begin its second life.',
  items: [
    {
      title: 'Item one',
      text: 'A single bolt of cloth, selected for the season.',
    },
    {
      title: 'Item two',
      text: 'Woven weight matched to the occasion and climate.',
    },
    {
      title: 'Item three',
      text: 'Finished with a pressed seam that holds its line for decades.',
    },
  ],
};

export const detailsB: DetailSection = {
  label: '07 — The Cut',
  title: 'Placeholder title for section B',
  body: 'The cut begins on paper, traced by a cutter who has spent thirty years reading the body beneath the cloth.',
  items: [
    {
      title: 'Item one',
      text: 'A bespoke pattern drafted to your exact proportions.',
    },
    {
      title: 'Item two',
      text: 'Three fittings minimum, each one sharpening the line.',
    },
    {
      title: 'Item three',
      text: 'Finished by hand with stitches invisible to the eye.',
    },
  ],
};
