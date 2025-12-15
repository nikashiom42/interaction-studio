import { Car, Zap, Mountain, Compass, Wallet, Gauge } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type CarCategory = Database['public']['Enums']['car_category'];

const categories: { id: 'all' | CarCategory; label: string; icon: typeof Car }[] = [
  { id: 'all', label: 'All Cars', icon: Car },
  { id: 'luxury', label: 'Luxury', icon: Compass },
  { id: 'electric', label: 'Electric', icon: Zap },
  { id: 'suv', label: 'SUVs', icon: Mountain },
  { id: 'convertible', label: 'Convertible', icon: Car },
  { id: 'economy', label: 'Economy', icon: Wallet },
  { id: 'sports', label: 'Sports', icon: Gauge },
];

interface CategoryPillsProps {
  activeCategory: 'all' | CarCategory;
  onCategoryChange: (category: 'all' | CarCategory) => void;
}

const CategoryPills = ({ activeCategory, onCategoryChange }: CategoryPillsProps) => {
  return (
    <section className="py-6 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 btn-scale ${
                  isActive
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-secondary text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryPills;
