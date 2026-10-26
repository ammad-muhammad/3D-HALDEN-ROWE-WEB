import React from 'react';
import SmoothScroll from '@/components/SmoothScroll';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <SiteHeader />
      <main style={{ minHeight: '100svh', background: '#0B1410' }}>
        {children}
      </main>
      <SiteFooter />
    </SmoothScroll>
  );
}
