import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryPills from '@/components/CategoryPills';
import PopularCars from '@/components/PopularCars';
import CuratedRoadtrips from '@/components/CuratedRoadtrips';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import BlogSection from '@/components/BlogSection';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { usePageSEO } from '@/hooks/usePageSEO';
import { Database } from '@/integrations/supabase/types';

type CarCategory = Database['public']['Enums']['car_category'];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | CarCategory>('all');
  const { data: seo } = usePageSEO('home');

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seo?.meta_title || "Rent Cars in Georgia"}
        description={seo?.meta_description || "Premium car rental in Georgia. Explore Tbilisi, Batumi, Gudauri and more. Self-drive or with driver. Best prices, free cancellation, 24/7 support."}
        url="/"
        keywords={seo?.keywords || undefined}
        image={seo?.og_image || undefined}
        canonicalUrl={seo?.canonical_url || undefined}
        noIndex={seo?.no_index || false}
        schemaMarkup={seo?.schema_markup || undefined}
      />
      <Header />
      <main>
        <HeroSection />
        <CategoryPills 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
        <PopularCars category={activeCategory} />
        <CuratedRoadtrips />
        <HowItWorks />
        <Testimonials />
        <BlogSection />
        <FAQ />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
