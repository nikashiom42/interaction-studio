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
  { value: 'luxury_suv', label: 'Luxury SUV' },
  { value: 'off_road', label: 'Off-Road' },
  { value: 'suv', label: 'SUV' },
  { value: 'jeep', label: 'Jeep' },
  { value: 'economy_suv', label: 'Economy SUV' },
  { value: 'convertible', label: 'Convertible' },
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
  category: z.enum(['luxury_suv', 'off_road', 'suv', 'jeep', 'economy_suv', 'convertible']),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  seats: z.coerce.number().min(1).max(20),
  transmission: z.enum(['manual', 'automatic']),
  fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  price_per_day: z.coerce.number().min(0),
  price_with_driver: z.coerce.number().min(0).optional().nullable(),
  features: z.array(z.string()).optional(),
  is_active: z.boolean(),
  delivery_available: z.boolean(),
  advance_booking_days: z.coerce.number().min(1).max(365),
  description: z.string().optional().nullable(),
  meta_title: z.string().max(60, 'Meta title should be under 60 characters').optional().nullable(),
  meta_description: z.string().max(160, 'Meta description should be under 160 characters').optional().nullable(),
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
      category: 'suv',
      categories: [],
      seats: 5,
      transmission: 'automatic',
      fuel_type: 'petrol',
      price_per_day: 0,
      price_with_driver: null,
      features: [],
      is_active: true,
      delivery_available: false,
      advance_booking_days: 30,
      description: '',
      meta_title: '',
      meta_description: '',
    },
  });

  useEffect(() => {
    if (car) {
      const features = Array.isArray(car.features) ? car.features as string[] : [];
      const carCategories = Array.isArray(car.categories) && car.categories.length > 0
        ? car.categories
        : [car.category]; // Fallback to single category if categories array is empty
      form.reset({
        brand: car.brand,
        model: car.model,
        category: car.category,
        categories: carCategories,
        seats: car.seats,
        transmission: car.transmission,
        fuel_type: car.fuel_type,
        price_per_day: Number(car.price_per_day),
        price_with_driver: car.price_with_driver ? Number(car.price_with_driver) : null,
        features,
        is_active: car.is_active ?? true,
        delivery_available: car.delivery_available ?? false,
        advance_booking_days: car.advance_booking_days ?? 30,
        description: (car as any).description || '',
        meta_title: (car as any).meta_title || '',
        meta_description: (car as any).meta_description || '',
      });
      setMainImage(car.main_image || null);
      setGalleryImages(car.gallery_images || []);
    } else {
      form.reset({
        brand: '',
        model: '',
        category: 'suv',
        categories: [],
        seats: 5,
        transmission: 'automatic',
        fuel_type: 'petrol',
        price_per_day: 0,
        price_with_driver: null,
        features: [],
        is_active: true,
        delivery_available: false,
        advance_booking_days: 30,
        description: '',
        meta_title: '',
        meta_description: '',
      });
      setMainImage(null);
      setGalleryImages([]);
    }
  }, [car, form]);

  const mutation = useMutation({
    mutationFn: async (values: CarFormValues) => {
      // Use first selected category as primary category for backward compatibility
      const primaryCategory = values.categories[0] as typeof values.category;
      const carData = {
        brand: values.brand,
        model: values.model,
        category: primaryCategory,
        categories: values.categories,
        seats: values.seats,
        transmission: values.transmission,
        fuel_type: values.fuel_type,
        price_per_day: values.price_per_day,
        price_with_driver: values.price_with_driver || null,
        features: values.features || [],
        is_active: values.is_active,
        delivery_available: values.delivery_available,
        advance_booking_days: values.advance_booking_days,
        main_image: mainImage,
        gallery_images: galleryImages,
        description: values.description || null,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
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
                    name="categories"
                    render={() => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-3">
                          {categories.map((cat) => (
                            <FormField
                              key={cat.value}
                              control={form.control}
                              name="categories"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(cat.value)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, cat.value]);
                                        } else {
                                          field.onChange(current.filter((v) => v !== cat.value));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {cat.label}
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

                <div className="grid grid-cols-2 gap-4">
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
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
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
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
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

              {/* Description */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground border-b border-border pb-2">About This Car</h3>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Describe the car, its features, what makes it special..."
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">This will be shown in the "About this car" section</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground border-b border-border pb-2">SEO Settings</h3>
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Rent Range Rover Sport in Tbilisi | Premium SUV Rental"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {(field.value?.length || 0)}/60 characters - Used for search engine results
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="A brief description for search engines..."
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {(field.value?.length || 0)}/160 characters - Shown in search engine results
                      </p>
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
