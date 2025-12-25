import { Car, Mountain, Compass, Wallet, TruckIcon } from 'lucide-react';

type CarCategory = 'luxury_suv' | 'off_road' | 'suv' | 'jeep' | 'economy_suv' | 'convertible';

const categories: { id: 'all' | CarCategory; label: string; icon: typeof Car }[] = [
  { id: 'all', label: 'All Cars', icon: Car },
  { id: 'luxury_suv', label: 'Luxury SUV', icon: Compass },
  { id: 'off_road', label: 'Off-Road', icon: Mountain },
  { id: 'suv', label: 'SUV', icon: TruckIcon },
  { id: 'jeep', label: 'Jeep', icon: TruckIcon },
  { id: 'economy_suv', label: 'Economy SUV', icon: Wallet },
  { id: 'convertible', label: 'Convertible', icon: Car },
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
