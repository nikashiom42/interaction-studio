import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Add-ons pricing configuration
export const ADDON_PRICING = {
  childSeat: {
    pricePerDay: 3, // €3 per day per seat
    maxQuantity: 4,
  },
  campingEquipment: {
    pricePerDay: 10, // €10 per day for 2-person camping equipment
  },
};

export interface CartItem {
  id: string;
  type: 'car' | 'tour';
  carId?: string;
  tourId?: string;
  carName?: string;
  tourName?: string;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  dropoffTime?: string;
  withDriver?: boolean;
  location?: string;
  pricePerDay: number;
  totalPrice: number;
  days: number;
  category?: string;
  image?: string;
  // Add-ons
  childSeats?: number;
  childSeatsTotal?: number;
  campingEquipment?: boolean;
  campingEquipmentTotal?: number;
  addonsTotal?: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  isInCart: (carId?: string, tourId?: string, startDate?: string, endDate?: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const itemCount = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const addItem = (item: CartItem) => {
    setItems((prev) => [...prev, { ...item, id: `${item.type}-${Date.now()}` }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (carId?: string, tourId?: string, startDate?: string, endDate?: string) => {
    return items.some(
      (item) =>
        ((carId && item.carId === carId) || (tourId && item.tourId === tourId)) &&
        item.startDate === startDate &&
        item.endDate === endDate
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
