import { Star } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface CarCardProps {
  image: string;
  name: string;
  type: string;
  rating: number;
  originalPrice: number;
  price: number;
  delay?: number;
}

const CarCard = ({ image, name, type, rating, originalPrice, price, delay = 0 }: CarCardProps) => {
  return (
    <div 
      className="group bg-card rounded-xl overflow-hidden shadow-card card-hover opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <Star className="w-3.5 h-3.5 fill-star text-star" />
          <span className="text-sm font-medium text-foreground">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3">{type}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground text-sm line-through">{formatPrice(originalPrice)}</span>
            <span className="text-primary text-xl font-bold">{formatPrice(price)}</span>
            <span className="text-muted-foreground text-sm">/day</span>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg btn-scale hover:bg-coral-hover transition-colors shadow-button">
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
