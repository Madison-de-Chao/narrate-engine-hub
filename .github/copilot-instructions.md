# Copilot Instructions for Narrate Engine Hub

## Project Overview

This is a React-based web application built with modern TypeScript and deployed on Lovable.dev. The project focuses on Bazi (Chinese astrology) analysis and narrative generation.

**Tech Stack:**
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **UI Framework:** shadcn-ui components with Radix UI primitives
- **Styling:** Tailwind CSS with custom theme configuration
- **State Management:** TanStack React Query
- **Routing:** React Router DOM v6
- **Backend:** Supabase (database and edge functions)
- **Testing:** Bun test runner

## Development Commands

- **Start dev server:** `npm run dev` (runs on port 8080)
- **Build for production:** `npm run build`
- **Build for development:** `npm run build:dev`
- **Lint code:** `npm run lint`
- **Run tests:** `npm test`
- **Preview production build:** `npm run preview`

## Code Style and Conventions

### TypeScript Configuration
- TypeScript is configured with **relaxed strict mode**
- `strict: false`, `noImplicitAny: false`
- `noUnusedParameters: false`, `noUnusedLocals: false`
- `strictNullChecks: false`
- Skip library checks with `skipLibCheck: true`
- Allow JavaScript files with `allowJs: true`

### Import Paths
- **Always use the `@/*` path alias** for imports from the `src/` directory
- Example: `import { Button } from "@/components/ui/button"`
- Example: `import { useToast } from "@/hooks/use-toast"`

### ESLint Rules
- Uses TypeScript ESLint with recommended configs
- React Hooks rules are enforced
- `@typescript-eslint/no-unused-vars` is turned **off**
- React Refresh warnings for component exports

### Component Patterns
- UI components are located in `src/components/ui/` (shadcn-ui components)
- Feature components are in `src/components/`
- Pages are in `src/pages/`
- Use functional components with TypeScript
- Leverage Radix UI primitives for accessible components

### Styling
- Use Tailwind CSS utility classes
- Custom theme extends default Tailwind with HSL color variables
- Custom colors for "legion" categories: family, growth, self, future
- Dark mode support via class-based strategy
- shadcn-ui component styling patterns

### Routing
- Use React Router DOM v6
- All routes defined in `src/App.tsx`
- Custom routes must be added **above** the catch-all `*` route
- NotFound component handles 404s

### State Management
- Use TanStack React Query for server state
- React hooks for local component state
- Query client configured at the app root

## Project Structure

```
src/
├── components/       # Feature components
│   └── ui/          # shadcn-ui components
├── pages/           # Route pages (Index, Auth, BaziTest, NotFound)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and shared code
├── data/            # Static data and constants
├── integrations/    # External service integrations (Supabase)
├── assets/          # Static assets
├── App.tsx          # Main app component with routing
└── main.tsx         # Entry point

supabase/
└── functions/       # Supabase Edge Functions
    ├── calculate-bazi/
    └── generate-legion-story/
```

## Supabase Integration

- Supabase client configured in `src/integrations/supabase/`
- Edge functions in `supabase/functions/`:
  - `calculate-bazi`: Computes Bazi pillars, loads solar term data from database
  - `generate-legion-story`: AI-powered narrative generation
- Solar terms data stored in `solar_terms` table in Supabase

## Testing

- Test runner: Bun
- Run tests with `npm test`
- Follow existing test patterns when adding new tests

## Best Practices

1. **Minimal Changes:** Make the smallest possible changes to accomplish the task
2. **Type Safety:** Use TypeScript types, but be aware of the relaxed config
3. **Component Reusability:** Leverage shadcn-ui components when possible
4. **Accessibility:** Radix UI primitives provide accessible foundations
5. **Responsive Design:** Use Tailwind responsive utilities
6. **Path Aliases:** Always use `@/*` imports for consistency
7. **Edge Functions:** Supabase edge functions handle compute-intensive operations
8. **Code Review:** Run linter before committing (`npm run lint`)
9. **Build Validation:** Test builds with `npm run build` before finalizing

## Special Notes

- This project is deployed and managed via Lovable.dev platform
- Development server runs on port 8080 (configured in `vite.config.ts`)
- The `lovable-tagger` plugin is enabled in development mode only
- Git operations and deployments are typically handled through Lovable platform

## Domain Knowledge

- **Bazi (八字):** Traditional Chinese astrology system based on birth date/time
- **Four Pillars:** Year, Month, Day, and Hour pillars in Bazi
- **Heavenly Stems & Earthly Branches:** Components of each pillar
- **Solar Terms (节气):** 24 divisions of the solar year used in calculations
- **Legion Cards:** Narrative elements categorized as Family, Growth, Self, or Future
