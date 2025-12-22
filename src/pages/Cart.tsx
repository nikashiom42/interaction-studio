import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Calendar, MapPin, Clock, ArrowRight, Baby, Tent } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useCart } from '@/hooks/useCart';
import { useLocations } from '@/hooks/useLocations';
import { formatPrice } from '@/lib/currency';
import { format, parseISO } from 'date-fns';

const Cart = () => {
  const { items, itemCount, totalPrice, removeItem, clearCart } = useCart();
  const { locations } = useLocations();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <SEO title="Shopping Cart" description="View your cart" url="/cart" noIndex />
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some cars or tours to get started!</p>
            <Link
              to="/cars"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium btn-scale hover:bg-coral-hover transition-colors"
            >
              Browse Cars
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <SEO title="Shopping Cart" description="View your cart" url="/cart" noIndex />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>
          {itemCount > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-destructive hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const location = locations.find(loc => loc.id === (item.location || 'tbs'));

              return (
                <div
                  key={item.id}
                  className="bg-card rounded-xl p-6 shadow-card animate-fade-in"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-32 h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.carName || item.tourName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs text-primary font-semibold uppercase">
                            {item.type === 'car' ? 'Car Rental' : 'Tour Package'}
                          </span>
                          <h3 className="font-semibold text-foreground">
                            {item.carName || item.tourName}
                          </h3>
                          {item.category && (
                            <p className="text-sm text-muted-foreground capitalize">
                              {item.category}{item.withDriver ? ' • With Driver' : ' • Self-drive'}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(parseISO(item.startDate), 'MMM d')} {item.pickupTime} - {format(parseISO(item.endDate), 'MMM d, yyyy')} {item.dropoffTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.days} Days</span>
                        </div>
                      </div>

                      {location && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{location.name}</span>
                        </div>
                      )}

                      {/* Add-ons display */}
                      {((item.childSeats && item.childSeats > 0) || item.campingEquipment) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.childSeats && item.childSeats > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              <Baby className="w-3 h-3" />
                              Child Seat ×{item.childSeats} ({formatPrice(item.childSeatsTotal || 0)})
                            </span>
                          )}
                          {item.campingEquipment && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              <Tent className="w-3 h-3" />
                              Camping Equipment ({formatPrice(item.campingEquipmentTotal || 0)})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(item.pricePerDay)} × {item.days} days
                          {(item.addonsTotal && item.addonsTotal > 0) && ` + ${formatPrice(item.addonsTotal)} add-ons`}
                        </div>
                        <div className="text-xl font-bold text-foreground">
                          {formatPrice(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-xl p-6 shadow-card">
              <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>

              <div className="space-y-3 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="flex justify-between py-4">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
              </div>

              <Link
                to="/checkout"
                className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg btn-scale hover:bg-coral-hover transition-colors shadow-button flex items-center justify-center gap-2 mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/cars"
                className="w-full py-3 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors flex items-center justify-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
