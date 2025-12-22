import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PickupLocation {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  deliveryFee: number;
  isActive: boolean;
  displayOrder: number;
}

export const useLocations = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Map database fields to match the existing interface
      return data.map((location) => ({
        id: location.id,
        name: location.name,
        city: location.city,
        lat: location.lat,
        lng: location.lng,
        deliveryFee: Number(location.delivery_fee),
        isActive: location.is_active,
        displayOrder: location.display_order,
      })) as PickupLocation[];
    },
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  // Default fallback locations
  const defaultLocations: PickupLocation[] = [
    { id: 'tbs', name: 'Tbilisi Airport (TBS)', city: 'Tbilisi', lat: 41.6692, lng: 44.9547, deliveryFee: 0, isActive: true, displayOrder: 1 },
    { id: 'tbilisi-center', name: 'Tbilisi City Center', city: 'Tbilisi', lat: 41.7151, lng: 44.8271, deliveryFee: 0, isActive: true, displayOrder: 2 },
  ];

  return {
    locations: data || defaultLocations,
    isLoading,
    error,
  };
};
