import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryPills from '@/components/CategoryPills';
import PopularCars from '@/components/PopularCars';
import CuratedRoadtrips from '@/components/CuratedRoadtrips';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import { Database } from '@/integrations/supabase/types';

type CarCategory = Database['public']['Enums']['car_category'];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | CarCategory>('all');

  return (
    <div className="min-h-screen bg-background">
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
      </main>
      <Footer />
    </div>
  );
};

export default Index;
