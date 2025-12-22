import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  MapPin
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

type Location = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  delivery_fee: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const LocationsManagement = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    city: '',
    lat: 0,
    lng: 0,
    delivery_fee: 0,
    is_active: true,
    display_order: 0,
  });

  // Fetch locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Location[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (selectedLocation) {
        const { error } = await supabase
          .from('locations')
          .update(data)
          .eq('id', selectedLocation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('locations')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({ title: `Location ${selectedLocation ? 'updated' : 'created'} successfully!` });
      setFormOpen(false);
      setSelectedLocation(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error saving location',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('locations')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({ title: 'Location status updated!' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({ title: 'Location deleted successfully!' });
      setDeleteDialogOpen(false);
      setSelectedLocation(null);
    },
  });

  const filteredLocations = locations?.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      id: location.id,
      name: location.name,
      city: location.city,
      lat: location.lat,
      lng: location.lng,
      delivery_fee: location.delivery_fee,
      is_active: location.is_active,
      display_order: location.display_order,
    });
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedLocation(null);
    setFormData({
      id: '',
      name: '',
      city: '',
      lat: 0,
      lng: 0,
      delivery_fee: 0,
      is_active: true,
      display_order: (locations?.length || 0) + 1,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-8 h-8 text-primary" />
            Manage Locations & Delivery Fees
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure pickup/delivery locations and their fees
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Total Locations</p>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Active Locations</p>
            <MapPin className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations?.filter(l => l.is_active).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Free Delivery</p>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations?.filter(l => l.delivery_fee === 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLocations && filteredLocations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Location Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Delivery Fee</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      {location.display_order}
                    </TableCell>
                    <TableCell className="font-medium">
                      {location.name}
                    </TableCell>
                    <TableCell>{location.city}</TableCell>
                    <TableCell>
                      <span className={location.delivery_fee === 0 ? 'text-success font-semibold' : 'text-foreground'}>
                        {location.delivery_fee === 0 ? 'Free' : `$${location.delivery_fee}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={location.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: location.id, is_active: checked })
                          }
                        />
                        <Badge variant={location.is_active ? 'default' : 'secondary'}>
                          {location.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(location)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLocation(location);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No locations found matching your search.' : 'No locations yet. Add your first location!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">Location ID *</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="tbs"
                  required
                  disabled={!!selectedLocation}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Tbilisi"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tbilisi Airport (TBS)"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude *</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lng">Longitude *</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_fee">Delivery Fee ($) *</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  step="0.01"
                  value={formData.delivery_fee}
                  onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })}
                  required
                />
                <p className="text-xs text-muted-foreground">Enter 0 for free delivery</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active (visible to users)</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedLocation ? 'Update Location' : 'Create Location'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedLocation && deleteMutation.mutate(selectedLocation.id)}
        title="Delete Location"
        description={`Are you sure you want to delete "${selectedLocation?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LocationsManagement;
