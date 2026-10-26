export interface AtelierRow {
  numeral: string;
  title: string;
  body: string;
  meta: string;
}

export interface AtelierCta {
  primary: string;
  secondary: string;
}

export interface AtelierData {
  label: string;
  title: string;
  intro: string;
  rows: [AtelierRow, AtelierRow, AtelierRow, AtelierRow];
  cta: AtelierCta;
}

export const atelier: AtelierData = {
  label: "08 — The Fitting",
  title: "Four fittings. One suit.",
  intro: "From first measurement to final hand-pressed finish, the bespoke journey requires patience, precision, and seventy hours of master craftsmanship.",
  rows: [
    {
      numeral: "I",
      title: "The Consultation",
      body: "We begin with a conversation over single malt. We discuss your posture, your habits, and choose among twelve thousand cloths from Huddersfield to Biella.",
      meta: "Week 1 · 90 minutes",
    },
    {
      numeral: "II",
      title: "The Baste",
      body: "A temporary skeleton of raw canvas and white baste thread. The cutter pins and chalks directly onto your frame, shaping the coat to your shoulder line.",
      meta: "Week 3 · 60 minutes",
    },
    {
      numeral: "III",
      title: "The Forward Fitting",
      body: "Pockets set, facings attached, and lapels padded by hand. Here we refine the balance, drape, and trousers break with micro-millimeter adjustments.",
      meta: "Week 5 · 45 minutes",
    },
    {
      numeral: "IV",
      title: "The Finish",
      body: "Hand-stitched buttonholes, horn buttons sewn with waxed thread, and a final steam press on our bespoke pressing bucks before delivery.",
      meta: "Week 7 · 30 minutes",
    },
  ],
  cta: {
    primary: "Book a Private Fitting",
    secondary: "Visit the Atelier",
  },
};
