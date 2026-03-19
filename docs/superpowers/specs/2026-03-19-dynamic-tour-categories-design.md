# Dynamic Tour Categories - Design Spec

## Problem
Tour categories are hardcoded in 5+ places across the codebase. Adding/removing categories requires code changes in multiple files plus a DB enum migration. Admin should be able to manage categories dynamically.

## Approach
**Approach C: Text array on tours + lookup table** — matches existing car categories pattern.

## Database Changes

### New table: `tour_categories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Default gen_random_uuid() |
| name | text NOT NULL | Display name, e.g. "Day Tours" |
| slug | text UNIQUE NOT NULL | URL-friendly, e.g. "day-tours" |
| display_order | integer DEFAULT 0 | Controls filter pill ordering |
| created_at | timestamptz | Default now() |

Seed with existing 8 categories: beach, mountains, city_tours, day_tours, adventure, cultural, wildlife, desert.

### Changes to `tours` table
- Add `categories text[]` — array of category slugs
- Add `slug text UNIQUE NOT NULL` — auto-generated from tour name
- Keep existing `category` enum column for backward compat (populated from first element of categories array)
- Migrate existing data: `categories = ARRAY[category::text]`, `slug = generated from name`

## Admin Changes

### Tour Categories Management (`/admin/tour-categories`)
- Table: name, slug, display order, edit/delete actions
- Add/edit dialog: name + slug fields (slug auto-generates from name)
- Display order via numeric field
- Delete protection: warn if tours use the category

### Tour Form (`TourFormDialog`)
- Replace hardcoded category dropdown with multi-select checkboxes
- Options fetched dynamically from `tour_categories` table
- First selected category = primary `category` field for backward compat
- Add slug field with auto-generate from tour name

## Public Page Changes

### Tour List (`TourList.tsx`)
- Filter pills fetched dynamically from `tour_categories` ordered by `display_order`
- Remove all hardcoded category arrays
- Filtering uses `overlaps` operator for multi-category matching
- Support `?category=slug` URL param for pre-filtering

### Tour URLs
- New route: `/tours/:category/:slug` (e.g. `/tours/day-tours/hidden-georgia`)
- Keep `/trip/:id` for backward compat
- Category in URL = first category slug

### Tour Breadcrumbs
- Each category is a clickable link: `Home > Tours > Day Tours, Adventure > Tour Name`
- Clicking a category navigates to `/tours?category=<slug>`

## Files to Modify
1. **New migration** — create `tour_categories` table, add columns to `tours`, migrate data
2. **New admin page** — `src/pages/admin/TourCategoriesManagement.tsx`
3. **New admin form** — `src/components/admin/TourCategoryFormDialog.tsx`
4. `src/integrations/supabase/types.ts` — add tour_categories table type, slug on tours
5. `src/pages/TourList.tsx` — dynamic filters, overlaps query, URL param support
6. `src/pages/TripDetail.tsx` — slug-based fetch, clickable breadcrumbs
7. `src/components/admin/TourFormDialog.tsx` — dynamic categories, slug field
8. `src/pages/admin/ToursManagement.tsx` — remove hardcoded badge colors
9. `src/App.tsx` — add `/tours/:category/:slug` route, admin route for tour-categories
10. `src/components/admin/AdminLayout.tsx` — add Tour Categories to sidebar nav
11. `src/lib/utils.ts` — add tour URL helper function
