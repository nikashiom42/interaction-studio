import { Star, BadgeCheck } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  name: string;
  memberSince: string;
  avatar: string;
  rating: number;
  delay?: number;
}

const TestimonialCard = ({ quote, name, memberSince, avatar, rating, delay = 0 }: TestimonialCardProps) => {
  return (
    <div 
      className="bg-card p-6 rounded-xl shadow-card card-hover opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-star text-star' : 'text-gray-200'}`}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-foreground text-sm mb-6 leading-relaxed">"{quote}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-coral-hover flex items-center justify-center text-primary-foreground font-medium text-sm">
            {avatar}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-primary text-sm">{name}</span>
            <BadgeCheck className="w-4 h-4 text-success fill-success/20" />
          </div>
          <p className="text-muted-foreground text-xs">Rentals Member since {memberSince}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
