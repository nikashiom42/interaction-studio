import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Euro, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

const SettingsManagement = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    childSeatPrice: 0,
    childSeatMaxQty: 4,
    campingEquipmentPrice: 0,
  });

  // Fetch addon pricing settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['addon-pricing-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'addon_pricing')
        .single();

      if (error) throw error;

      const addonPricing = data.value as unknown as AddonPricing;
      setFormData({
        childSeatPrice: addonPricing.childSeat.pricePerDay,
        childSeatMaxQty: addonPricing.childSeat.maxQuantity,
        campingEquipmentPrice: addonPricing.campingEquipment.pricePerDay,
      });

      return data;
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      const addonPricing: AddonPricing = {
        childSeat: {
          pricePerDay: formData.childSeatPrice,
          maxQuantity: formData.childSeatMaxQty,
          label: 'Child Seat',
        },
        campingEquipment: {
          pricePerDay: formData.campingEquipmentPrice,
          label: 'Camping Equipment (for 2 people)',
        },
      };

      const { error } = await supabase
        .from('settings')
        .update({ value: JSON.parse(JSON.stringify(addonPricing)) })
        .eq('key', 'addon_pricing');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addon-pricing-settings'] });
      queryClient.invalidateQueries({ queryKey: ['addon-pricing'] });
      toast({ title: 'Settings updated successfully!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating settings',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Euro className="w-8 h-8 text-primary" />
          Addon Pricing Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure prices for booking add-ons
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Addon Prices</h2>
            <p className="text-sm text-muted-foreground">
              Set daily rental prices for optional add-ons
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Child Seat Settings */}
            <div className="space-y-4 pb-6 border-b">
              <h3 className="font-semibold text-lg">Child Seat</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childSeatPrice">Price Per Day ($) *</Label>
                  <Input
                    id="childSeatPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.childSeatPrice}
                    onChange={(e) => setFormData({ ...formData, childSeatPrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childSeatMaxQty">Maximum Quantity *</Label>
                  <Input
                    id="childSeatMaxQty"
                    type="number"
                    min="1"
                    value={formData.childSeatMaxQty}
                    onChange={(e) => setFormData({ ...formData, childSeatMaxQty: parseInt(e.target.value) || 1 })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of child seats per booking
                  </p>
                </div>
              </div>
            </div>

            {/* Camping Equipment Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Camping Equipment</h3>
              <div className="space-y-2">
                <Label htmlFor="campingEquipmentPrice">Price Per Day ($) *</Label>
                <Input
                  id="campingEquipmentPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.campingEquipmentPrice}
                  onChange={(e) => setFormData({ ...formData, campingEquipmentPrice: parseFloat(e.target.value) || 0 })}
                  required
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Price for camping equipment set (for 2 people)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default SettingsManagement;
