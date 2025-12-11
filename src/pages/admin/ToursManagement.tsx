import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Loader2,
  MapPin,
  Upload,
  Copy,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TourFormDialog } from '@/components/admin/TourFormDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

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
  created_at: string;
  updated_at: string;
};

// Seed data for demo tours - typed to match database schema
const seedTours: {
  name: string;
  description: string;
  category: 'beach' | 'mountains' | 'city_tours' | 'day_tours' | 'adventure' | 'cultural' | 'wildlife' | 'desert';
  duration_type: 'fixed' | 'flexible';
  duration_days: number;
  duration_label: string;
  main_image: string;
  is_active: boolean;
  is_featured: boolean;
  destinations: string[];
  route_type: 'fixed' | 'flexible';
  route_details: string;
  start_location: string;
  end_location: string;
  base_price: number;
  price_per_person: boolean;
  pricing_tiers: { min_days: number; max_days: number; price: number }[];
  included_services: string[];
  max_participants: number;
  advance_booking_days: number;
  display_order: number;
  rating: number;
  reviews_count: number;
}[] = [
  {
    name: 'Pacific Coast Highway',
    description: 'Experience the breathtaking views of the California coastline in a convertible. Embark on the ultimate road trip along California\'s iconic Pacific Coast Highway. This 5-day journey takes you through stunning coastal cliffs, charming beach towns, and world-renowned landmarks.',
    category: 'beach',
    duration_type: 'fixed',
    duration_days: 5,
    duration_label: '5 Days',
    main_image: '/images/trips/pacific.jpg',
    is_active: true,
    is_featured: true,
    destinations: ['San Francisco', 'Monterey', 'Big Sur', 'Santa Barbara', 'Los Angeles'],
    route_type: 'fixed',
    route_details: 'Highway 1 coastal route',
    start_location: 'San Francisco, CA',
    end_location: 'Los Angeles, CA',
    base_price: 499,
    price_per_person: true,
    pricing_tiers: [
      { min_days: 1, max_days: 3, price: 350 },
      { min_days: 4, max_days: 7, price: 499 },
      { min_days: 8, max_days: 14, price: 450 }
    ],
    included_services: ['Premium convertible rental', 'Curated route with GPS', 'Hotel recommendations', '24/7 roadside assistance', 'Fuel card ($200 value)'],
    max_participants: 4,
    advance_booking_days: 30,
    display_order: 1,
    rating: 4.9,
    reviews_count: 128
  },
  {
    name: 'Rocky Mountain Escape',
    description: 'Discover the majesty of the Rocky Mountains on this 3-day adventure. Navigate winding mountain roads, pristine alpine lakes, and breathtaking summit views. This trip offers the perfect blend of adventure and tranquility.',
    category: 'mountains',
    duration_type: 'fixed',
    duration_days: 3,
    duration_label: '3 Days',
    main_image: '/images/trips/rocky.jpg',
    is_active: true,
    is_featured: true,
    destinations: ['Denver', 'Estes Park', 'Rocky Mountain National Park'],
    route_type: 'fixed',
    route_details: 'Trail Ridge Road scenic route',
    start_location: 'Denver, CO',
    end_location: 'Denver, CO',
    base_price: 350,
    price_per_person: true,
    pricing_tiers: [
      { min_days: 1, max_days: 2, price: 280 },
      { min_days: 3, max_days: 5, price: 350 },
      { min_days: 6, max_days: 10, price: 320 }
    ],
    included_services: ['SUV or Jeep rental', 'National Park pass', 'Curated mountain route', '24/7 roadside assistance', 'Picnic essentials kit'],
    max_participants: 6,
    advance_booking_days: 30,
    display_order: 2,
    rating: 4.8,
    reviews_count: 89
  },
  {
    name: 'Desert Safari Route',
    description: 'Experience the raw beauty of the American Southwest on this 2-day desert adventure. Navigate red rock canyons, vast dune fields, and ancient landscapes in a rugged 4x4. Perfect for those seeking adventure off the beaten path.',
    category: 'desert',
    duration_type: 'fixed',
    duration_days: 2,
    duration_label: '2 Days',
    main_image: '/images/trips/desert.jpg',
    is_active: true,
    is_featured: false,
    destinations: ['Phoenix', 'Sonoran Desert', 'Red Rock Canyon'],
    route_type: 'flexible',
    route_details: 'Off-road desert trails',
    start_location: 'Phoenix, AZ',
    end_location: 'Phoenix, AZ',
    base_price: 280,
    price_per_person: true,
    pricing_tiers: [
      { min_days: 1, max_days: 2, price: 280 },
      { min_days: 3, max_days: 5, price: 250 }
    ],
    included_services: ['4x4 Jeep Wrangler rental', 'Off-road trail maps', 'Camping gear (optional)', '24/7 roadside assistance', 'Cooler with refreshments'],
    max_participants: 4,
    advance_booking_days: 14,
    display_order: 3,
    rating: 4.7,
    reviews_count: 56
  }
];

export default function ToursManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  // Fetch tours
  const { data: tours, isLoading } = useQuery({
    queryKey: ['admin-tours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Tour[];
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('tours')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast({ title: 'Tour status updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating tour', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle featured status
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from('tours')
        .update({ is_featured })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast({ title: 'Featured status updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating tour', description: error.message, variant: 'destructive' });
    },
  });

  // Delete tour
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast({ title: 'Tour deleted successfully' });
      setIsDeleteOpen(false);
      setSelectedTour(null);
    },
    onError: (error) => {
      toast({ title: 'Error deleting tour', description: error.message, variant: 'destructive' });
    },
  });

  // Duplicate tour
  const duplicateMutation = useMutation({
    mutationFn: async (tour: Tour) => {
      const duplicateData = {
        name: `${tour.name} (Copy)`,
        description: tour.description,
        category: tour.category as 'beach' | 'mountains' | 'city_tours' | 'day_tours' | 'adventure' | 'cultural' | 'wildlife' | 'desert',
        duration_type: tour.duration_type as 'fixed' | 'flexible',
        duration_days: tour.duration_days,
        duration_label: tour.duration_label,
        main_image: tour.main_image,
        gallery_images: tour.gallery_images || [],
        is_active: false,
        is_featured: tour.is_featured,
        destinations: tour.destinations || [],
        route_type: tour.route_type as 'fixed' | 'flexible',
        route_details: tour.route_details,
        start_location: tour.start_location,
        end_location: tour.end_location,
        base_price: tour.base_price,
        price_per_person: tour.price_per_person,
        pricing_tiers: tour.pricing_tiers || [],
        additional_fees: tour.additional_fees || {},
        included_services: tour.included_services || [],
        max_participants: tour.max_participants,
        advance_booking_days: tour.advance_booking_days,
        display_order: tour.display_order,
        meta_title: tour.meta_title,
        meta_description: tour.meta_description,
      };
      const { error } = await supabase
        .from('tours')
        .insert(duplicateData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast({ title: 'Tour duplicated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error duplicating tour', description: error.message, variant: 'destructive' });
    },
  });

  // Seed tours
  const seedMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('tours')
        .insert(seedTours);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast({ title: 'Demo tours added successfully', description: '3 sample tours have been added.' });
    },
    onError: (error) => {
      toast({ title: 'Error seeding data', description: error.message, variant: 'destructive' });
    },
  });

  const filteredTours = tours?.filter(tour => 
    tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.destinations?.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setIsFormOpen(true);
  };

  const handleDelete = (tour: Tour) => {
    setSelectedTour(tour);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTour(null);
    setIsFormOpen(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      beach: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      mountains: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      city_tours: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      day_tours: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      adventure: 'bg-red-500/10 text-red-500 border-red-500/20',
      cultural: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      wildlife: 'bg-green-500/10 text-green-500 border-green-500/20',
      desert: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tours Management</h2>
          <p className="text-muted-foreground">Manage your tours and road trips</p>
        </div>
        <div className="flex gap-2">
          {(!tours || tours.length === 0) && (
            <Button
              variant="outline"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              {seedMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Seed Demo Tours
            </Button>
          )}
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tour
          </Button>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredTours?.length || 0} tours total
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTours && filteredTours.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                    <TableHead className="text-right">Base Price</TableHead>
                    <TableHead className="text-center">Featured</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTours.map((tour) => (
                    <TableRow key={tour.id}>
                      <TableCell>
                        <div className="relative">
                          {tour.main_image ? (
                            <img
                              src={tour.main_image}
                              alt={tour.name}
                              className="w-16 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-muted rounded-md flex items-center justify-center">
                              <MapPin className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{tour.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {tour.start_location} → {tour.end_location}
                          </div>
                          {tour.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-muted-foreground">
                                {tour.rating} ({tour.reviews_count} reviews)
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryBadgeColor(tour.category)}>
                          {tour.category.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {tour.duration_label || `${tour.duration_days} days`}
                      </TableCell>
                      <TableCell className="text-right font-medium">${tour.base_price}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={tour.is_featured ?? false}
                          onCheckedChange={(checked) => 
                            toggleFeaturedMutation.mutate({ id: tour.id, is_featured: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={tour.is_active ?? false}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: tour.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateMutation.mutate(tour)}
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(tour)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tour)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-1">No tours yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first tour or seeding demo data.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => seedMutation.mutate()}>
                  Seed Demo Tours
                </Button>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tour
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TourFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tour={selectedTour}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => selectedTour && deleteMutation.mutate(selectedTour.id)}
        title="Delete Tour"
        description={`Are you sure you want to delete "${selectedTour?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
