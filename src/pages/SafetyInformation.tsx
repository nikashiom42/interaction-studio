import { Link } from 'react-router-dom';
import { ChevronRight, Check, X, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const SafetyInformation = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Car Rental Insurance in Georgia | Pegarent"
        description="All Pegarent rental cars are insured with 100% exterior damage coverage. Drive across Georgia with confidence. Learn what's covered and what's not."
        url="/safety-information"
      />
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Safety Information</span>
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Car Rental Insurance in Georgia</h1>
          <p className="text-lg text-muted-foreground mb-8">
            At Pegarent, <Link to="/cars" className="text-primary hover:underline">all vehicles</Link> are insured to provide peace of mind during your trip. Our insurance covers exterior damage, so you can drive across Georgia with confidence. Whether in Tbilisi, at the airport, or on longer road trips.
          </p>

          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">What Is Covered</h2>
              <p className="mb-3">Your rental includes insurance that covers <strong className="text-foreground">100% of exterior damage</strong> to the vehicle.</p>
              <p className="mb-3">This includes:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Scratches, dents, and body damage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Damage from road accidents or collisions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Vandalism or third-party actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Natural events such as hail, storms, or flooding</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">What Is Not Covered</h2>
              <p className="mb-3">To keep everything transparent, please note that insurance does not cover:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Interior damage</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Mechanical or engine-related issues not caused by an accident</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Damage caused by misuse or violation of traffic laws</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Intentional damage or negligent behavior</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">What to Do in Case of Damage</h2>
              <p className="mb-3">If any damage occurs during your rental:</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Inform us as soon as possible</li>
                <li>Provide basic details about the incident</li>
                <li>Follow instructions from our team</li>
                <li>The vehicle may be inspected if required</li>
              </ol>
              <p className="mt-3">Once approved, repair costs will be handled according to the insurance policy.</p>
            </section>

            <section className="bg-amber-500/5 rounded-xl p-6 border border-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-2">Important Conditions</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Insurance applies only when the vehicle is used according to local traffic laws</li>
                    <li>The driver must be authorized under the rental agreement</li>
                    <li>Coverage may be affected if terms are violated</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Drive with Confidence in Georgia</h2>
              <p>Our goal is to make <Link to="/" className="text-primary hover:underline">car rental in Georgia</Link> simple, safe, and stress-free. With clear insurance coverage and no hidden surprises, you can focus on enjoying your trip.</p>
            </section>

            <section className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <h2 className="text-xl font-bold text-foreground mb-2">Need Help or Clarification?</h2>
              <p>
                If you have any questions about insurance or your rental, <Link to="/contact" className="text-primary hover:underline font-medium">contact us</Link> anytime. We're happy to help you understand your coverage and plan your trip.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default SafetyInformation;
