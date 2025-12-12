# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a car rental and road trip tour booking platform built with React, TypeScript, Vite, and Supabase. The application allows users to browse and rent luxury cars, book curated road trips, and manage their bookings. It includes both customer-facing pages and an admin dashboard for managing inventory and bookings.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui (Radix UI components + Tailwind CSS)
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS with tailwindcss-animate
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm build

# Build for development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── admin/           # Admin-specific components (forms, layouts, dialogs)
│   └── [feature].tsx    # Feature-specific components (CarCard, BookingWidget, etc.)
├── pages/
│   ├── admin/           # Admin dashboard pages (management interfaces)
│   └── [page].tsx       # Public pages (Index, CarList, TourList, Checkout, etc.)
├── hooks/
│   ├── useAuth.tsx      # Authentication context and hook
│   └── use-*.ts         # Other custom hooks
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase client instance
│       └── types.ts     # Auto-generated database types
├── lib/
│   ├── utils.ts         # Utility functions (cn for class merging)
│   └── currency.ts      # Currency formatting utilities
├── data/               # Static data (country codes, etc.)
├── assets/            # Images and static assets
└── App.tsx            # Main app with routing configuration
```

## Architecture

### Routing Structure

The app uses React Router v6 with the following route patterns:
- Public routes: `/`, `/cars`, `/tours`, `/car/:id`, `/trip/:id`, `/checkout`, `/about`, `/contact`
- Auth routes: `/auth`, `/dashboard`
- Admin routes: `/admin/login`, `/admin/*` (wrapped in AdminLayout with sidebar)

**IMPORTANT**: All custom routes must be defined BEFORE the catch-all `*` route in App.tsx, otherwise they will be caught by the NotFound page.

### Authentication System

Authentication is managed through a custom AuthProvider (src/hooks/useAuth.tsx) that wraps the Supabase auth system:
- Provides `useAuth()` hook with user, session, roles, isAdmin, signIn, signUp, signOut
- Implements role-based access control (RBAC) with roles: 'admin', 'moderator', 'user'
- User roles are fetched from `user_roles` table in Supabase
- Auth state is persisted in localStorage and auto-refreshes tokens

### Database Schema

Key Supabase tables:
- `bookings` - Rental bookings with payment tracking and status
- `cars` - Vehicle inventory with pricing and specifications
- `tours` - Curated road trip packages
- `locations` - Pickup/dropoff locations
- `user_roles` - Role assignments for users
- `reviews` - Customer reviews

The database types are auto-generated in `src/integrations/supabase/types.ts`. When the schema changes, regenerate types using Supabase CLI.

### State Management

TanStack Query (React Query) is used for server state management:
- Wrapped at root level in App.tsx with QueryClientProvider
- Used for fetching and caching data from Supabase
- Handles loading states, error handling, and cache invalidation

### UI Components

The project uses shadcn/ui components extensively:
- All UI components are in `src/components/ui/`
- Components use Radix UI primitives with custom Tailwind styling
- Class merging is handled by the `cn()` utility function in `lib/utils.ts`
- Theme support via next-themes (dark mode capable)

### Admin System

Admin routes are protected and use a nested layout:
- AdminLayout provides a consistent sidebar navigation
- Admin pages manage: cars, bookings, users, tours
- Admin authentication uses role-based access (isAdmin check from useAuth)

## Supabase Integration

### Local Development

```bash
# Initialize Supabase locally (if not already done)
npx supabase init

# Start local Supabase instance
npx supabase start

# Stop local instance
npx supabase stop

# Create new migration
npx supabase migration new <migration_name>

# Apply migrations
npx supabase db push

# Generate TypeScript types from database
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Environment Variables

Required environment variables (in .env):
```
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your_supabase_anon_key>
```

### Migrations

Database migrations are stored in `supabase/migrations/` with timestamp-based naming. The project has several migrations for:
- Initial schema setup
- User roles and permissions
- Booking system enhancements
- Reviews and ratings

## TypeScript Configuration

- Path alias `@/*` maps to `src/*` (configured in vite.config.ts and tsconfig.json)
- Import components using: `import { Component } from '@/components/Component'`
- TypeScript strict checks are partially disabled:
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - `noUnusedLocals: false`
  - `noUnusedParameters: false`

**Note**: Per user's global CLAUDE.md instructions, never use `any` type - create proper type interfaces instead.

## Styling Guidelines

- Use Tailwind CSS utility classes for styling
- Use `cn()` utility for conditional class merging
- Follow shadcn/ui component patterns for consistency
- Theme-aware styling uses CSS variables defined in index.css

## Common Patterns

### Data Fetching with Supabase
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);
```

### Protected Routes
Check authentication status using the useAuth hook:
```typescript
const { user, isAdmin, isLoading } = useAuth();
```

### Form Validation
Forms use React Hook Form with Zod schemas for validation.

## Testing

No test framework is currently configured in this project.

## Deployment

The project is configured for deployment via Lovable.dev platform. Build the production bundle using `npm run build` which outputs to the `dist/` directory.
