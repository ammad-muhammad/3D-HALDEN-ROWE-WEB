'use client';

import { useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmoothScroll  from '@/components/SmoothScroll';
import Loader        from '@/components/Loader';
import Navbar        from '@/components/Navbar';
import ScrollHero    from '@/components/hero/ScrollHero';
import DetailsStage  from '@/components/details/DetailsStage';

export default function Experience() {
  const [introReady, setIntroReady] = useState(false);

  function handleLoaderReady() {
    // Refresh ScrollTrigger so pinSpacing is computed with correct
    // document height now that the loader overlay is gone
    ScrollTrigger.refresh();
    setIntroReady(true);
  }

  return (
    <SmoothScroll>
      <Loader onReady={handleLoaderReady} />
      <Navbar    introReady={introReady} />
      <ScrollHero introReady={introReady} />
      <DetailsStage />
    </SmoothScroll>
  );
}
