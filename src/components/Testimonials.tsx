import TestimonialCard from './TestimonialCard';

const testimonials = [
  {
    id: 1,
    quote: "The booking process was incredibly smooth. The car was in pristine condition and the customer service was top-notch. Highly recommend!",
    name: 'Sarah Jenkins',
    memberSince: '2021',
    avatar: 'SJ',
    rating: 5,
  },
  {
    id: 2,
    quote: "I rented a convertible for a weekend trip to Napa. It made the experience unforgettable. Will definitely use this service again.",
    name: 'Michael Chen',
    memberSince: '2022',
    avatar: 'MC',
    rating: 5,
  },
  {
    id: 3,
    quote: "Great selection of electric vehicles. I loved trying out the new Tesla Model S. Seamless pickup and dropoff!",
    name: 'Emma Wilson',
    memberSince: '2023',
    avatar: 'EW',
    rating: 4,
  },
];

const Testimonials = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-8">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              {...testimonial}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
