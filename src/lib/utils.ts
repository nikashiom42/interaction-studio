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
