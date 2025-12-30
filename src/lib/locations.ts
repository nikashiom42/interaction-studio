// Pickup locations with GPS coordinates and delivery fees
export interface PickupLocation {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  deliveryFee: number;
}

export const pickupLocations: PickupLocation[] = [
  { id: 'tbs', name: 'Tbilisi Airport (TBS)', city: 'Tbilisi', lat: 41.6692, lng: 44.9547, deliveryFee: 0 },
  { id: 'tbilisi-center', name: 'Tbilisi City Center', city: 'Tbilisi', lat: 41.7151, lng: 44.8271, deliveryFee: 0 },
  { id: 'batumi', name: 'Batumi Airport', city: 'Batumi', lat: 41.6103, lng: 41.5997, deliveryFee: 30 },
  { id: 'batumi-center', name: 'Batumi City Center', city: 'Batumi', lat: 41.6168, lng: 41.6367, deliveryFee: 30 },
  { id: 'kutaisi', name: 'Kutaisi Airport', city: 'Kutaisi', lat: 42.1766, lng: 42.4822, deliveryFee: 30 },
  { id: 'gudauri', name: 'Gudauri Ski Resort', city: 'Gudauri', lat: 42.4789, lng: 44.4706, deliveryFee: 30 },
  { id: 'bakuriani', name: 'Bakuriani Ski Resort', city: 'Bakuriani', lat: 41.7497, lng: 43.5325, deliveryFee: 30 },
  { id: 'kazbegi', name: 'Kazbegi (Stepantsminda)', city: 'Kazbegi', lat: 42.6598, lng: 44.6420, deliveryFee: 30 },
  { id: 'mestia', name: 'Mestia', city: 'Mestia', lat: 43.0444, lng: 42.7289, deliveryFee: 30 },
];

/**
 * Get delivery fee for a location
 * @param locationId - The location ID
 * @returns Delivery fee in euros (0 for Tbilisi, 30 for others)
 */
export const getDeliveryFee = (locationId: string): number => {
  const location = pickupLocations.find(loc => loc.id === locationId);
  return location?.deliveryFee ?? 30; // Default to €30 if location not found
};

/**
 * Get location details by ID
 * @param locationId - The location ID
 * @returns Location object or undefined
 */
export const getLocationById = (locationId: string): PickupLocation | undefined => {
  return pickupLocations.find(loc => loc.id === locationId);
};

/**
 * Check if a location is in Tbilisi (free delivery)
 * @param locationId - The location ID
 * @returns true if location is in Tbilisi
 */
export const isTbilisiLocation = (locationId: string): boolean => {
  const location = getLocationById(locationId);
  return location?.city === 'Tbilisi';
};
