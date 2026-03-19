import { Search, CalendarDays, Car } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: Search,
    title: 'Find your car',
    description: 'Browse our available rental cars, from economy models to SUVs and 4x4 vehicles for any trip.',
  },
  {
    id: 2,
    icon: CalendarDays,
    title: 'Book your dates',
    description: 'Choose your pick-up and drop-off dates in Tbilisi or at the airport using our simple booking system.',
  },
  {
    id: 3,
    icon: Car,
    title: 'Hit the road',
    description: 'Collect your car or request delivery, then explore Georgia at your own pace.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">How to Rent a Car in Georgia in 3 Easy Steps</h2>
          <p className="text-muted-foreground">Reserve your car rental in Georgia in minutes and pick it up in Tbilisi or at the airport.</p>
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
