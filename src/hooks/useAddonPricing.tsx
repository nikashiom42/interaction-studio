import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AddonPricing {
  childSeat: {
    pricePerDay: number;
    maxQuantity: number;
    label: string;
  };
  campingEquipment: {
    pricePerDay: number;
    label: string;
  };
}

export const useAddonPricing = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['addon-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'addon_pricing')
        .single();

      if (error) throw error;
      return data.value as AddonPricing;
    },
    // Cache for 5 minutes to reduce database calls
    staleTime: 5 * 60 * 1000,
  });

  // Return default values if still loading or error
  const defaultPricing: AddonPricing = {
    childSeat: {
      pricePerDay: 3,
      maxQuantity: 4,
      label: 'Child Seat',
    },
    campingEquipment: {
      pricePerDay: 10,
      label: 'Camping Equipment (for 2 people)',
    },
  };

  return {
    addonPricing: data || defaultPricing,
    isLoading,
    error,
  };
};
