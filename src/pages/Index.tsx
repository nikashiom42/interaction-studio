import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryPills from '@/components/CategoryPills';
import PopularCars from '@/components/PopularCars';
import ExploreDestinations from '@/components/ExploreDestinations';
import CuratedRoadtrips from '@/components/CuratedRoadtrips';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoryPills />
        <PopularCars />
        <ExploreDestinations />
        <CuratedRoadtrips />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
