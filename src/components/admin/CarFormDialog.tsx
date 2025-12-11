import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUpload } from './ImageUpload';

type Car = Tables<'cars'>;

const categories = [
  { value: 'economy', label: 'Economy' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'sports', label: 'Sports' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'electric', label: 'Electric' },
] as const;

const transmissions = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
] as const;

const fuelTypes = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

const featureOptions = [
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'gps', label: 'GPS Navigation' },
  { id: 'bluetooth', label: 'Bluetooth' },
  { id: 'child_seat', label: 'Child Seat Available' },
  { id: '4x4', label: '4x4 / AWD' },
  { id: 'sunroof', label: 'Sunroof' },
  { id: 'usb_charging', label: 'USB Charging' },
];

const carFormSchema = z.object({
  brand: z.string().min(1, 'Brand is required').max(100),
  model: z.string().min(1, 'Model is required').max(100),
  category: z.enum(['economy', 'suv', 'luxury', 'minivan', 'sports', 'convertible', 'electric']),
  seats: z.coerce.number().min(1).max(20),
  transmission: z.enum(['manual', 'automatic']),
  fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  engine_volume: z.string().max(20).optional().nullable(),
  price_per_day: z.coerce.number().min(0),
  price_with_driver: z.coerce.number().min(0).optional().nullable(),
  features: z.array(z.string()).optional(),
  is_active: z.boolean(),
  delivery_available: z.boolean(),
  advance_booking_days: z.coerce.number().min(1).max(365),
});

type CarFormValues = z.infer<typeof carFormSchema>;

interface CarFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car | null;
}

export function CarFormDialog({ open, onOpenChange, car }: CarFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!car;
  
  // Image state (managed separately from form)
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      brand: '',
      model: '',
      category: 'economy',
      seats: 5,
      transmission: 'automatic',
      fuel_type: 'petrol',
      engine_volume: '',
      price_per_day: 0,
      price_with_driver: null,
      features: [],
      is_active: true,
      delivery_available: false,
      advance_booking_days: 30,
    },
  });

  useEffect(() => {
    if (car) {
      const features = Array.isArray(car.features) ? car.features as string[] : [];
      form.reset({
        brand: car.brand,
        model: car.model,
        category: car.category,
        seats: car.seats,
        transmission: car.transmission,
        fuel_type: car.fuel_type,
        engine_volume: car.engine_volume || '',
        price_per_day: Number(car.price_per_day),
        price_with_driver: car.price_with_driver ? Number(car.price_with_driver) : null,
        features,
        is_active: car.is_active ?? true,
        delivery_available: car.delivery_available ?? false,
        advance_booking_days: car.advance_booking_days ?? 30,
      });
      setMainImage(car.main_image || null);
      setGalleryImages(car.gallery_images || []);
    } else {
      form.reset({
        brand: '',
        model: '',
        category: 'economy',
        seats: 5,
        transmission: 'automatic',
        fuel_type: 'petrol',
        engine_volume: '',
        price_per_day: 0,
        price_with_driver: null,
        features: [],
        is_active: true,
        delivery_available: false,
        advance_booking_days: 30,
      });
      setMainImage(null);
      setGalleryImages([]);
    }
  }, [car, form]);

  const mutation = useMutation({
    mutationFn: async (values: CarFormValues) => {
      const carData = {
        brand: values.brand,
        model: values.model,
        category: values.category,
        seats: values.seats,
        transmission: values.transmission,
        fuel_type: values.fuel_type,
        engine_volume: values.engine_volume || null,
        price_per_day: values.price_per_day,
        price_with_driver: values.price_with_driver || null,
        features: values.features || [],
        is_active: values.is_active,
        delivery_available: values.delivery_available,
        advance_booking_days: values.advance_booking_days,
        main_image: mainImage,
        gallery_images: galleryImages,
      };

      if (isEditing && car) {
        const { error } = await supabase
          .from('cars')
          .update(carData)
          .eq('id', car.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cars')
          .insert(carData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast({ title: isEditing ? 'Car updated successfully' : 'Car added successfully' });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: 'Error saving car', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (values: CarFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{isEditing ? 'Edit Car' : 'Add New Car'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 pt-4 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground border-b border-border pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Toyota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Land Cruiser" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Seats</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={20} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transmissions.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fuel_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fuelTypes.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="engine_volume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engine Volume</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2.0L" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground border-b border-border pb-2">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price_per_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Day (Self-drive)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" min={0} className="pl-7" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price_with_driver"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Day (With Driver)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="number" 
                              min={0} 
                              className="pl-7" 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground border-b border-border pb-2">Features</h3>
                <FormField
                  control={form.control}
                  name="features"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {featureOptions.map((feature) => (
                          <FormField
                            key={feature.id}
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(feature.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, feature.id]);
                                      } else {
                                        field.onChange(current.filter((v) => v !== feature.id));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {feature.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground border-b border-border pb-2">Images</h3>
                <ImageUpload
                  mainImage={mainImage}
                  galleryImages={galleryImages}
                  onMainImageChange={setMainImage}
                  onGalleryImagesChange={setGalleryImages}
                  carId={car?.id}
                />
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground border-b border-border pb-2">Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="advance_booking_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Booking Limit (days)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={365} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="delivery_available"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <FormLabel className="text-base">Delivery Available</FormLabel>
                          <p className="text-sm text-muted-foreground">Allow delivery to customer address</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <FormLabel className="text-base">Active</FormLabel>
                          <p className="text-sm text-muted-foreground">Make this car available for booking</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditing ? 'Update Car' : 'Add Car'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
