import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';

type Tour = {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_type: string;
  duration_days: number;
  duration_label: string | null;
  main_image: string | null;
  gallery_images: string[] | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  destinations: string[] | null;
  route_type: string;
  route_details: string | null;
  start_location: string | null;
  end_location: string | null;
  base_price: number;
  price_per_person: boolean | null;
  pricing_tiers: any;
  additional_fees: any;
  included_services: any;
  max_participants: number | null;
  advance_booking_days: number | null;
  display_order: number | null;
  meta_title: string | null;
  meta_description: string | null;
  rating: number | null;
  reviews_count: number | null;
};

interface TourFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour | null;
}

const categories = [
  { value: 'beach', label: 'Beach' },
  { value: 'mountains', label: 'Mountains' },
  { value: 'city_tours', label: 'City Tours' },
  { value: 'day_tours', label: 'Day Tours' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'wildlife', label: 'Wildlife' },
  { value: 'desert', label: 'Desert' },
];

const defaultServices = [
  'Professional driver',
  'Fuel',
  'Insurance',
  'Guide',
  'Meals',
  'Entrance tickets',
  'Hotel accommodation',
  '24/7 roadside assistance',
];

export function TourFormDialog({ open, onOpenChange, tour }: TourFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!tour;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'beach',
    duration_type: 'fixed',
    duration_days: 1,
    duration_label: '',
    main_image: '',
    gallery_images: [] as string[],
    is_active: true,
    is_featured: false,
    destinations: [] as string[],
    route_type: 'fixed',
    route_details: '',
    start_location: '',
    end_location: '',
    base_price: 0,
    price_per_person: true,
    pricing_tiers: [] as { min_days: number; max_days: number; price: number }[],
    additional_fees: {} as Record<string, number>,
    included_services: [] as string[],
    max_participants: 10,
    advance_booking_days: 30,
    display_order: 0,
    meta_title: '',
    meta_description: '',
  });

  const [newDestination, setNewDestination] = useState('');
  const [newService, setNewService] = useState('');
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (tour) {
      setFormData({
        name: tour.name,
        description: tour.description,
        category: tour.category,
        duration_type: tour.duration_type,
        duration_days: tour.duration_days,
        duration_label: tour.duration_label || '',
        main_image: tour.main_image || '',
        gallery_images: tour.gallery_images || [],
        is_active: tour.is_active ?? true,
        is_featured: tour.is_featured ?? false,
        destinations: tour.destinations || [],
        route_type: tour.route_type,
        route_details: tour.route_details || '',
        start_location: tour.start_location || '',
        end_location: tour.end_location || '',
        base_price: tour.base_price,
        price_per_person: tour.price_per_person ?? true,
        pricing_tiers: tour.pricing_tiers || [],
        additional_fees: tour.additional_fees || {},
        included_services: tour.included_services || [],
        max_participants: tour.max_participants || 10,
        advance_booking_days: tour.advance_booking_days || 30,
        display_order: tour.display_order || 0,
        meta_title: tour.meta_title || '',
        meta_description: tour.meta_description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'beach',
        duration_type: 'fixed',
        duration_days: 1,
        duration_label: '',
        main_image: '',
        gallery_images: [],
        is_active: true,
        is_featured: false,
        destinations: [],
        route_type: 'fixed',
        route_details: '',
        start_location: '',
        end_location: '',
        base_price: 0,
        price_per_person: true,
        pricing_tiers: [],
        additional_fees: {},
        included_services: [],
        max_participants: 10,
        advance_booking_days: 30,
        display_order: 0,
        meta_title: '',
        meta_description: '',
      });
    }
  }, [tour, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `tours/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tour-images')
        .getPublicUrl(filePath);

      if (isMain) {
        setFormData(prev => ({ ...prev, main_image: publicUrl }));
      } else {
        setFormData(prev => ({
          ...prev,
          gallery_images: [...prev.gallery_images, publicUrl]
        }));
      }
      toast({ title: 'Image uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Error uploading image', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  const addDestination = () => {
    if (newDestination.trim()) {
      setFormData(prev => ({
        ...prev,
        destinations: [...prev.destinations, newDestination.trim()]
      }));
      setNewDestination('');
    }
  };

  const removeDestination = (index: number) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index)
    }));
  };

  const toggleService = (service: string) => {
    setFormData(prev => {
      const services = prev.included_services.includes(service)
        ? prev.included_services.filter(s => s !== service)
        : [...prev.included_services, service];
      return { ...prev, included_services: services };
    });
  };

  const addCustomService = () => {
    if (newService.trim() && !formData.included_services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        included_services: [...prev.included_services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const addPricingTier = () => {
    setFormData(prev => ({
      ...prev,
      pricing_tiers: [...prev.pricing_tiers, { min_days: 1, max_days: 3, price: 0 }]
    }));
  };

  const updatePricingTier = (index: number, field: string, value: number) => {
    setFormData(prev => {
      const tiers = [...prev.pricing_tiers];
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...prev, pricing_tiers: tiers };
    });
  };

  const removePricingTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricing_tiers: prev.pricing_tiers.filter((_, i) => i !== index)
    }));
  };

  const addFee = () => {
    if (newFeeName.trim() && newFeeAmount) {
      setFormData(prev => ({
        ...prev,
        additional_fees: {
          ...prev.additional_fees,
          [newFeeName.trim()]: parseFloat(newFeeAmount)
        }
      }));
      setNewFeeName('');
      setNewFeeAmount('');
    }
  };

  const removeFee = (key: string) => {
    setFormData(prev => {
      const fees = { ...prev.additional_fees };
      delete fees[key];
      return { ...prev, additional_fees: fees };
    });
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const tourData = {
        name: data.name,
        description: data.description,
        category: data.category as 'beach' | 'mountains' | 'city_tours' | 'day_tours' | 'adventure' | 'cultural' | 'wildlife' | 'desert',
        duration_type: data.duration_type as 'fixed' | 'flexible',
        duration_days: data.duration_days,
        duration_label: data.duration_label || null,
        main_image: data.main_image || null,
        gallery_images: data.gallery_images.length > 0 ? data.gallery_images : [],
        is_active: data.is_active,
        is_featured: data.is_featured,
        destinations: data.destinations.length > 0 ? data.destinations : [],
        route_type: data.route_type as 'fixed' | 'flexible',
        route_details: data.route_details || null,
        start_location: data.start_location || null,
        end_location: data.end_location || null,
        base_price: data.base_price,
        price_per_person: data.price_per_person,
        pricing_tiers: data.pricing_tiers.length > 0 ? data.pricing_tiers : [],
        additional_fees: data.additional_fees,
        included_services: data.included_services.length > 0 ? data.included_services : [],
        max_participants: data.max_participants,
        advance_booking_days: data.advance_booking_days,
        display_order: data.display_order,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
      };

      if (isEditing && tour) {
        const { error } = await supabase
          .from('tours')
          .update(tourData)
          .eq('id', tour.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tours')
          .insert(tourData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast({ title: isEditing ? 'Tour updated successfully' : 'Tour created successfully' });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: 'Error saving tour', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.base_price) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tour' : 'Add New Tour'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[70vh] pr-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="route">Route</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Tour Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration_type">Duration Type</Label>
                    <Select
                      value={formData.duration_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, duration_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration_days">Duration (Days)</Label>
                    <Input
                      id="duration_days"
                      type="number"
                      min="1"
                      value={formData.duration_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration_label">Duration Label (e.g., "Full Day")</Label>
                    <Input
                      id="duration_label"
                      value={formData.duration_label}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_label: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4 pt-4 border-t">
                  <Label>Main Image</Label>
                  <div className="flex gap-4 items-start">
                    {formData.main_image ? (
                      <div className="relative">
                        <img src={formData.main_image} alt="Main" className="w-32 h-24 object-cover rounded-md" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => setFormData(prev => ({ ...prev, main_image: '' }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : null}
                    <label className="flex items-center justify-center w-32 h-24 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, true)}
                        disabled={uploading}
                      />
                      {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                    </label>
                  </div>

                  <Label>Gallery Images</Label>
                  <div className="flex flex-wrap gap-4">
                    {formData.gallery_images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt={`Gallery ${i + 1}`} className="w-24 h-18 object-cover rounded-md" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removeGalleryImage(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex items-center justify-center w-24 h-18 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={uploading}
                      />
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="route" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_location">Start Location</Label>
                    <Input
                      id="start_location"
                      value={formData.start_location}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_location: e.target.value }))}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_location">End Location</Label>
                    <Input
                      id="end_location"
                      value={formData.end_location}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_location: e.target.value }))}
                      placeholder="e.g., Los Angeles, CA"
                    />
                  </div>

                  <div>
                    <Label htmlFor="route_type">Route Type</Label>
                    <Select
                      value={formData.route_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, route_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Route</SelectItem>
                        <SelectItem value="flexible">Flexible Route</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="route_details">Route Details</Label>
                    <Textarea
                      id="route_details"
                      value={formData.route_details}
                      onChange={(e) => setFormData(prev => ({ ...prev, route_details: e.target.value }))}
                      placeholder="Describe the route..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>Destinations / Cities</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.destinations.map((dest, i) => (
                      <div key={i} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                        <span className="text-sm">{dest}</span>
                        <button type="button" onClick={() => removeDestination(i)}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                      placeholder="Add destination"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())}
                    />
                    <Button type="button" variant="outline" onClick={addDestination}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="base_price">Base Price (€) *</Label>
                    <Input
                      id="base_price"
                      type="number"
                      min="0"
                      value={formData.base_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={formData.price_per_person}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, price_per_person: checked }))}
                    />
                    <Label>Price per person</Label>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label>Pricing Tiers (Optional)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPricingTier}>
                      <Plus className="h-4 w-4 mr-1" /> Add Tier
                    </Button>
                  </div>
                  {formData.pricing_tiers.map((tier, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-md">
                      <Input
                        type="number"
                        min="1"
                        value={tier.min_days}
                        onChange={(e) => updatePricingTier(i, 'min_days', parseInt(e.target.value) || 1)}
                        className="w-20"
                        placeholder="Min"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="number"
                        min="1"
                        value={tier.max_days}
                        onChange={(e) => updatePricingTier(i, 'max_days', parseInt(e.target.value) || 1)}
                        className="w-20"
                        placeholder="Max"
                      />
                      <span className="text-muted-foreground">days = €</span>
                      <Input
                        type="number"
                        min="0"
                        value={tier.price}
                        onChange={(e) => updatePricingTier(i, 'price', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removePricingTier(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>Additional Fees</Label>
                  {Object.entries(formData.additional_fees).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                      <span>{key}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">€{value}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFee(key)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newFeeName}
                      onChange={(e) => setNewFeeName(e.target.value)}
                      placeholder="Fee name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={newFeeAmount}
                      onChange={(e) => setNewFeeAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-24"
                    />
                    <Button type="button" variant="outline" onClick={addFee}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <Label>Included Services</Label>
                <div className="grid grid-cols-2 gap-3">
                  {defaultServices.map((service) => (
                    <div key={service} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.included_services.includes(service)}
                        onCheckedChange={() => toggleService(service)}
                      />
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>Custom Services</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.included_services
                      .filter(s => !defaultServices.includes(s))
                      .map((service, i) => (
                        <div key={i} className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                          <span className="text-sm">{service}</span>
                          <button type="button" onClick={() => toggleService(service)}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add custom service"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
                    />
                    <Button type="button" variant="outline" onClick={addCustomService}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      min="1"
                      value={formData.max_participants}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="advance_booking_days">Advance Booking (Days)</Label>
                    <Input
                      id="advance_booking_days"
                      type="number"
                      min="1"
                      value={formData.advance_booking_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, advance_booking_days: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                    />
                    <Label>Featured on Homepage</Label>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">SEO Settings (Optional)</h4>
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="SEO title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="SEO description"
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Tour' : 'Create Tour'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
