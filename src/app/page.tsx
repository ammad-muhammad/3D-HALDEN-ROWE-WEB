import Experience from '@/components/Experience';
import AtelierSection from '@/components/atelier/AtelierSection';
import ProductsSection from '@/components/products/ProductsSection';
import SuitLanding from '@/components/products/SuitLanding';
import HeritageSection from '@/components/home/HeritageSection';
import ClothLibrary from '@/components/home/ClothLibrary';
import Testimonials from '@/components/home/Testimonials';
import BookFitting from '@/components/home/BookFitting';
import SiteFooter from '@/components/site/SiteFooter';

export default function Home() {
  return (
    <main>
      <Experience />
      <AtelierSection />
      <ProductsSection />
      <SuitLanding />
      <HeritageSection />
      <ClothLibrary />
      <Testimonials />
      <BookFitting />
      <SiteFooter />
    </main>
  );
}
