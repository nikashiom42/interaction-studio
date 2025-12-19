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
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Database } from '@/integrations/supabase/types';

type CarCategory = Database['public']['Enums']['car_category'];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | CarCategory>('all');

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Rent Cars in Georgia"
        description="Premium car rental in Georgia. Explore Tbilisi, Batumi, Gudauri and more. Self-drive or with driver. Best prices, free cancellation, 24/7 support."
        url="/"
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
        <FAQ />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
