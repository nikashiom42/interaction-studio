import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Car,
  Upload
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CarFormDialog } from '@/components/admin/CarFormDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

type Car = Tables<'cars'>;

// Seed data from existing frontend with images
const seedCars: Omit<TablesInsert<'cars'>, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    brand: 'Range Rover',
    model: 'Sport',
    category: 'luxury',
    seats: 5,
    transmission: 'automatic',
    fuel_type: 'petrol',
    price_per_day: 150,
    price_with_driver: 220,
    features: ['ac', 'gps', 'bluetooth', '4x4', 'usb_charging'],
    is_active: true,
    delivery_available: true,
    advance_booking_days: 30,
    main_image: '/images/cars/range-rover.jpg',
  },
  {
    brand: 'Chevrolet',
    model: 'Corvette',
    category: 'sports',
    seats: 2,
    transmission: 'automatic',
    fuel_type: 'petrol',
    price_per_day: 195,
    price_with_driver: 280,
    features: ['ac', 'gps', 'bluetooth', 'usb_charging'],
    is_active: true,
    delivery_available: true,
    advance_booking_days: 30,
    main_image: '/images/cars/corvette.jpg',
  },
  {
    brand: 'Mercedes',
    model: 'S-Class',
    category: 'luxury',
    seats: 5,
    transmission: 'automatic',
    fuel_type: 'petrol',
    price_per_day: 210,
    price_with_driver: 300,
    features: ['ac', 'gps', 'bluetooth', 'sunroof', 'usb_charging'],
    is_active: true,
    delivery_available: true,
    advance_booking_days: 30,
    main_image: '/images/cars/mercedes.jpg',
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    category: 'electric',
    seats: 5,
    transmission: 'automatic',
    fuel_type: 'electric',
    price_per_day: 85,
    price_with_driver: 150,
    features: ['ac', 'gps', 'bluetooth', 'usb_charging'],
    is_active: true,
    delivery_available: true,
    advance_booking_days: 30,
    main_image: '/images/cars/tesla.jpg',
  },
  {
    brand: 'Land Rover',
    model: 'Discovery',
    category: 'suv',
    seats: 7,
    transmission: 'automatic',
    fuel_type: 'diesel',
    price_per_day: 285,
    price_with_driver: 360,
    features: ['ac', 'gps', 'bluetooth', '4x4', 'usb_charging'],
    is_active: true,
    delivery_available: true,
    advance_booking_days: 30,
    main_image: '/images/cars/range-rover.jpg',
  },
  {
    brand: 'BMW',
    model: 'X5',
    category: 'suv',
    seats: 5,
    transmission: 'automatic',
    fuel_type: 'petrol',
    price_per_day: 210,
    price_with_driver: 290,
    features: ['ac', 'gps', 'bluetooth', 'sunroof', 'usb_charging'],
    is_active: true,
    delivery_available: true,
    advance_booking_days: 30,
    main_image: '/images/cars/mercedes.jpg',
  },
];

export default function CarsManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Fetch cars
  const { data: cars, isLoading } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Car[];
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('cars')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast({ title: 'Car status updated' });
    },
    onError: (error) => {
      toast({ title: 'Error updating car', description: error.message, variant: 'destructive' });
    },
  });

  // Delete car
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast({ title: 'Car deleted successfully' });
      setIsDeleteOpen(false);
      setSelectedCar(null);
    },
    onError: (error) => {
      toast({ title: 'Error deleting car', description: error.message, variant: 'destructive' });
    },
  });

  // Seed cars
  const seedMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('cars')
        .insert(seedCars);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast({ title: 'Seed data added successfully', description: '6 sample cars have been added.' });
    },
    onError: (error) => {
      toast({ title: 'Error seeding data', description: error.message, variant: 'destructive' });
    },
  });

  const filteredCars = cars?.filter(car => 
    car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setIsFormOpen(true);
  };

  const handleDelete = (car: Car) => {
    setSelectedCar(car);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCar(null);
    setIsFormOpen(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      economy: 'bg-success/10 text-success border-success/20',
      suv: 'bg-primary/10 text-primary border-primary/20',
      luxury: 'bg-warning/10 text-warning border-warning/20',
      minivan: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      sports: 'bg-destructive/10 text-destructive border-destructive/20',
      convertible: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      electric: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cars Management</h2>
          <p className="text-muted-foreground">Manage your fleet of vehicles</p>
        </div>
        <div className="flex gap-2">
          {(!cars || cars.length === 0) && (
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
              Seed Sample Data
            </Button>
          )}
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Car
          </Button>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredCars?.length || 0} cars total
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCars && filteredCars.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Car</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Seats</TableHead>
                    <TableHead>Transmission</TableHead>
                    <TableHead className="text-right">Price/Day</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell>
                        <div className="relative">
                          {car.main_image ? (
                            <img
                              src={car.main_image}
                              alt={`${car.brand} ${car.model}`}
                              className="w-16 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-muted rounded-md flex items-center justify-center">
                              <Car className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          {car.gallery_images && car.gallery_images.length > 0 && (
                            <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                              +{car.gallery_images.length}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{car.brand} {car.model}</div>
                          <div className="text-sm text-muted-foreground capitalize">{car.fuel_type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryBadgeColor(car.category)}>
                          {car.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{car.seats}</TableCell>
                      <TableCell className="capitalize">{car.transmission}</TableCell>
                      <TableCell className="text-right font-medium">${car.price_per_day}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={car.is_active ?? false}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: car.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(car)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(car)}
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
              <Car className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-1">No cars yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first car or seeding sample data.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => seedMutation.mutate()}>
                  Seed Sample Data
                </Button>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Car
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CarFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        car={selectedCar}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => selectedCar && deleteMutation.mutate(selectedCar.id)}
        title="Delete Car"
        description={`Are you sure you want to delete ${selectedCar?.brand} ${selectedCar?.model}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
