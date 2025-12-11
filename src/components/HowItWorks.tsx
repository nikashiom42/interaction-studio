import { Search, CalendarDays, Car } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: Search,
    title: 'Find your car',
    description: 'Choose from our wide range of premium vehicles for any occasion.',
  },
  {
    id: 2,
    icon: CalendarDays,
    title: 'Book your dates',
    description: 'Select your pick-up and drop-off dates with our easy-to-use calendar.',
  },
  {
    id: 3,
    icon: Car,
    title: 'Hit the road',
    description: 'Pick up your keys or get it delivered, and start your adventure.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">How It Works</h2>
          <p className="text-muted-foreground">Your journey begins with three simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center text-center opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
              >
                <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-6 shadow-card group hover:shadow-card-hover transition-shadow hover:-translate-y-1 cursor-pointer">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.id}. {step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
