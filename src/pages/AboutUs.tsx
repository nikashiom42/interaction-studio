import { Link } from 'react-router-dom';
import { ChevronRight, Car, CheckCircle, MapPin, Headphones, Shield, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { usePageSEO } from '@/hooks/usePageSEO';

const whyChoose = [
  'Pickup in Tbilisi and at the airport',
  'No hidden fees or unexpected charges',
  'Flexible booking and cancellation options',
  'Local expertise and travel support',
];

const fleetFeatures = [
  'Carefully inspected and maintained',
  'Clean, comfortable, and fully equipped',
  'Ready for both city driving and long road trips',
];

const focusPoints = [
  'Clear and transparent booking',
  'No hidden fees',
  'Flexible rental options',
  'Friendly and responsive support',
];

const planHelp = [
  'Best driving routes in Georgia',
  'Road conditions and travel tips',
  'Recommended destinations and road trips',
  'Pickup and delivery options',
];

const AboutUs = () => {
  const { data: seo } = usePageSEO('about');

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seo?.meta_title || "About Pegarent Car Rental in Georgia"}
        description={seo?.meta_description || "Pegarent is a car rental company in Georgia focused on providing reliable vehicles and a smooth travel experience. Pickup in Tbilisi and at the airport."}
        url="/about"
        keywords={seo?.keywords || undefined}
        image={seo?.og_image || undefined}
        canonicalUrl={seo?.canonical_url || undefined}
        noIndex={seo?.no_index || false}
        schemaMarkup={seo?.schema_markup || undefined}
      />
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">About</span>
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About Pegarent Car Rental in Georgia</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Pegarent is a <Link to="/" className="text-primary hover:underline">car rental company in Georgia</Link> focused on providing reliable vehicles and a smooth travel experience for every customer. We offer a wide range of cars, from economy models to SUVs and 4x4 vehicles, with pickup available in Tbilisi and at the airport.
          </p>

          <div className="space-y-10 text-muted-foreground">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Reliable Car Rental for Travel Across Georgia</h2>
              <p className="mb-3">Our goal is simple: to make car rental in Georgia easy, flexible, and stress-free.</p>
              <p className="mb-3">Every <Link to="/cars" className="text-primary hover:underline">vehicle in our fleet</Link> is:</p>
              <ul className="space-y-2">
                {fleetFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">Whether you are driving in Tbilisi or exploring mountain destinations like Kazbegi or Gudauri, we make sure your car is ready for the journey.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">More Than Just Car Rental</h2>
              <p className="mb-3">We believe renting a car is not just about transportation, it is about your entire travel experience in Georgia.</p>
              <p className="mb-3">That's why we focus on:</p>
              <ul className="space-y-2">
                {focusPoints.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">Our goal is to make your trip smooth, enjoyable, and fully under your control.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Personal Support for Your Trip</h2>
              <p className="mb-3">After completing your reservation, one of our managers will personally contact you to assist with your plans.</p>
              <p className="mb-3">You can ask about:</p>
              <ul className="space-y-2">
                {planHelp.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">We are always happy to help you <Link to="/tours" className="text-primary hover:underline">plan your trip</Link> and make the most of your time in Georgia.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Explore Georgia Your Way</h2>
              <p>With Pegarent, you can explore Georgia at your own pace: from the streets of Tbilisi to the mountains, coastlines, and hidden destinations across the country.</p>
              <p className="mt-2">We are here to make your journey simple, reliable, and memorable.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Why Choose Pegarent</h2>
              <p className="mb-3">We focus on making car rental in Georgia simple, transparent, and reliable for every traveler.</p>
              <ul className="space-y-2">
                {whyChoose.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <h2 className="text-xl font-bold text-foreground mb-2">Need Help Planning Your Trip?</h2>
              <p className="mb-2">Have questions about your booking or need advice for your trip in Georgia?</p>
              <p>Our team is here to help you choose the right car, plan your route, and make your journey smooth from start to finish.</p>
              <p className="mt-3">
                <Link to="/contact" className="text-primary hover:underline font-medium">Contact us</Link> anytime for assistance with your car rental in Georgia.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
