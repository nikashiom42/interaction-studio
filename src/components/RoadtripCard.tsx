import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight } from 'lucide-react';

interface RoadtripCardProps {
  id: number;
  image: string;
  title: string;
  days: number;
  miles: number;
  description: string;
  price: number;
  badge?: string;
  delay?: number;
}

const RoadtripCard = ({ id, image, title, days, miles, description, price, badge, delay = 0 }: RoadtripCardProps) => {
  return (
    <Link 
      to={`/trip/${id}`}
      className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up block"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md uppercase tracking-wide">
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{days} Days</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{miles} miles</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-muted-foreground text-sm">From </span>
            <span className="text-primary text-lg font-bold">${price}</span>
            <span className="text-muted-foreground text-sm">/trip</span>
          </div>
          <div className="flex items-center gap-1 text-primary font-medium">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoadtripCard;
