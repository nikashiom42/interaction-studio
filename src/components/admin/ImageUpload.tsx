import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { X, Upload, Loader2, Star, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  mainImage: string | null;
  galleryImages: string[];
  onMainImageChange: (url: string | null) => void;
  onGalleryImagesChange: (urls: string[]) => void;
  carId?: string;
}

export function ImageUpload({
  mainImage,
  galleryImages,
  onMainImageChange,
  onGalleryImagesChange,
  carId,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${carId || 'new'}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `cars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('car-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (isMain) {
        const url = await uploadImage(files[0]);
        if (url) onMainImageChange(url);
        toast({ title: 'Main image uploaded' });
      } else {
        const uploadedUrls: string[] = [];
        for (const file of Array.from(files)) {
          const url = await uploadImage(file);
          if (url) uploadedUrls.push(url);
        }
        onGalleryImagesChange([...galleryImages, ...uploadedUrls]);
        toast({ title: `${uploadedUrls.length} image(s) uploaded` });
      }
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [galleryImages, onMainImageChange, onGalleryImagesChange]);

  const removeMainImage = () => {
    onMainImageChange(null);
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = galleryImages.filter((_, i) => i !== index);
    onGalleryImagesChange(newGallery);
  };

  const setAsMainImage = (galleryIndex: number) => {
    const newMainImage = galleryImages[galleryIndex];
    const newGallery = galleryImages.filter((_, i) => i !== galleryIndex);
    if (mainImage) {
      newGallery.unshift(mainImage);
    }
    onMainImageChange(newMainImage);
    onGalleryImagesChange(newGallery);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Main Image <span className="text-muted-foreground">(Featured)</span>
        </label>
        {mainImage ? (
          <div className="relative inline-block">
            <img
              src={mainImage}
              alt="Main car"
              className="w-32 h-24 object-cover rounded-lg border border-border"
            />
            <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full p-1">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <button
              type="button"
              onClick={removeMainImage}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, true)}
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Upload</span>
              </>
            )}
          </label>
        )}
      </div>

      {/* Gallery Images */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Gallery Images <span className="text-muted-foreground">(Optional)</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {galleryImages.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Gallery ${index + 1}`}
                className="w-24 h-18 object-cover rounded-lg border border-border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setAsMainImage(index)}
                  className="p-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  title="Set as main"
                >
                  <Star className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="p-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Add more button */}
          <label className="flex flex-col items-center justify-center w-24 h-18 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, false)}
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImageIcon className="w-5 h-5 text-muted-foreground mb-0.5" />
                <span className="text-xs text-muted-foreground">Add</span>
              </>
            )}
          </label>
        </div>
      </div>

      {uploading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading...
        </p>
      )}
    </div>
  );
}
