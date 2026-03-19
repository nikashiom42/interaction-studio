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
        title={seo?.meta_title || "Car Rental in Georgia | Rent a Car in Tbilisi with Airport Pickup"}
        description={seo?.meta_description || "Looking for car rental in Georgia? Pick up your car in Tbilisi or at the airport. SUVs, 4x4 and economy cars available. No deposit options and instant booking."}
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
