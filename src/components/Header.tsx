import { useState } from 'react';
import { Search, Heart, User, ShoppingCart, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-foreground text-lg">Rentals</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div
              className={`flex items-center w-full bg-secondary rounded-full px-4 py-2 transition-all duration-300 ${
                isSearchFocused ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
            >
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search destinations, cars, or tours..."
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-foreground placeholder:text-muted-foreground"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <span className="hidden sm:inline">USD</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-full">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-full">
              <User className="w-5 h-5" />
            </button>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-full">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
