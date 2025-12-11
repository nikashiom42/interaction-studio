import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryPills from '@/components/CategoryPills';
import PopularCars from '@/components/PopularCars';
import CuratedRoadtrips from '@/components/CuratedRoadtrips';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoryPills />
        <PopularCars />
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
