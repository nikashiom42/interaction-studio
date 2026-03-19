import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const categoryLabels: Record<string, string> = {
  luxury_suv: 'Luxury SUV',
  off_road: 'Off-Road',
  suv: 'SUV',
  jeep: 'Jeep',
  economy_suv: 'Economy SUV',
  convertible: 'Convertible',
};

export function formatCategory(category: string): string {
  return categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
}

export function formatCategories(categories: string[] | null | undefined, fallbackCategory?: string): string {
  if (categories && categories.length > 0) {
    return categories.map(formatCategory).join(', ');
  }
  if (fallbackCategory) {
    return formatCategory(fallbackCategory);
  }
  return '';
}

/** Convert DB category enum (e.g. "luxury_suv") to URL slug (e.g. "luxury-suv") */
export function categoryToSlug(category: string): string {
  return category.replace(/_/g, '-');
}

/** Convert URL slug (e.g. "luxury-suv") back to DB category enum (e.g. "luxury_suv") */
export function slugToCategory(slug: string): string {
  return slug.replace(/-/g, '_');
}

/** Generate a URL-friendly slug from text */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

interface CarForUrl {
  slug?: string | null;
  id: string;
  brand: string;
  model: string;
  category: string;
  categories?: string[] | null;
}

/** Build the detail URL for a car: /cars/:category/:slug */
export function getCarDetailUrl(car: CarForUrl): string {
  const category = car.categories?.[0] || car.category;
  const slug = car.slug || generateSlug(`${car.brand} ${car.model}`);
  return `/cars/${categoryToSlug(category)}/${slug}`;
}

interface TourForUrl {
  slug?: string | null;
  id: string;
  name: string;
  category: string;
  categories?: string[] | null;
}

/** Build the detail URL for a tour: /tours/:category/:slug */
export function getTourDetailUrl(tour: TourForUrl): string {
  const category = tour.categories?.[0] || categoryToSlug(tour.category);
  const slug = tour.slug || generateSlug(tour.name);
  return `/tours/${category}/${slug}`;
}

/** Format a tour category slug to display name (e.g. "day-tours" → "Day Tours") */
export function formatTourCategory(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
