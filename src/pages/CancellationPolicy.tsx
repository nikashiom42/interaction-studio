import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Car Rental Cancellation Policy | Pegarent"
        description="Flexible car rental cancellation policy in Georgia. Free cancellation, no advance payment required, and easy booking modifications."
        url="/cancellation-policy"
      />
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Cancellation Policy</span>
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Car Rental Cancellation Policy</h1>
          <p className="text-lg text-muted-foreground mb-8">
            At Pegarent, we offer <Link to="/" className="text-primary hover:underline">flexible car rental in Georgia</Link> with a simple and transparent cancellation policy. You can cancel or modify your booking without stress, whether you are picking up your car in Tbilisi or at the airport.
          </p>

          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Free Cancellation for All Reservations</h2>
              <p className="mb-3">Reservations made through our website do not require advance payment. This means:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You can cancel your car rental in Georgia at any time before pickup</li>
                <li>No cancellation fees will be charged</li>
                <li>You can modify your booking without penalties</li>
              </ul>
              <p className="mt-3">We aim to provide a flexible and customer-friendly experience for all travelers.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Changes to Your Booking</h2>
              <p className="mb-3">Plans change, we get it. At Pegarent, you can easily:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Update your pickup or drop-off dates</li>
                <li>Change your <Link to="/cars" className="text-primary hover:underline">vehicle type</Link> (subject to availability)</li>
                <li>Adjust your rental details before your scheduled pickup</li>
              </ul>
              <p className="mt-3">We recommend informing us as early as possible to ensure availability.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">No-Show Policy</h2>
              <p className="mb-3">If a customer does not collect the vehicle at the scheduled time without prior notice:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The reservation may be marked as a no-show</li>
                <li>Future bookings may be subject to limitations at our discretion</li>
              </ul>
              <p className="mt-3">To avoid any issues, please notify us if your plans change.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Cancellation at Pickup</h2>
              <p className="mb-3">If you decide not to proceed with the rental at the time of pickup:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>No charges will be applied</li>
                <li>However, repeated last-minute cancellations may be reviewed, especially during high-demand periods</li>
              </ul>
              <p className="mt-3">This helps us ensure fair availability for all customers.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">High-Demand Periods</h2>
              <p className="mb-3">During peak seasons or high-demand dates:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We may prioritize confirmed bookings</li>
                <li>Last-minute cancellations or no-shows may affect future reservations</li>
              </ul>
              <p className="mt-3">We appreciate your understanding during busy travel periods in Georgia.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Our Commitment to Flexible Car Rental in Georgia</h2>
              <p className="mb-3">We strive to offer:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Transparent booking conditions</li>
                <li>No hidden fees</li>
                <li>Flexible cancellation options</li>
              </ul>
              <p className="mt-3">Whether you are renting a car in Tbilisi, at the airport, or planning a road trip across Georgia, our goal is to make your experience smooth and reliable.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">Policy Updates</h2>
              <p>We reserve the right to update this cancellation policy at any time. The latest version will always be available on our website.</p>
              <p className="mt-2">All reservations remain subject to availability and confirmation.</p>
            </section>

            <section className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <h2 className="text-xl font-bold text-foreground mb-2">Need Help With Your Booking?</h2>
              <p>
                <Link to="/contact" className="text-primary hover:underline font-medium">Contact us</Link> anytime to modify or cancel your reservation. Our team is available 24/7 to assist you.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default CancellationPolicy;
