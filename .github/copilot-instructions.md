# Copilot Instructions for narrate-engine-hub

## Project Overview

This is a **Narrate Engine Hub** - a React-based web application built with modern frontend technologies. The project is managed through Lovable.dev and uses Vite as the build tool.

## Technology Stack

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS with shadcn-ui components
- **Backend**: Supabase (serverless PostgreSQL, authentication, storage)
- **State Management**: @tanstack/react-query
- **UI Components**: Radix UI primitives with shadcn-ui
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Package Manager**: npm (with bun lockfile for tests)

## Project Structure

```
/src
  /components     - Reusable React components
  /pages          - Page-level components
  /hooks          - Custom React hooks
  /lib            - Utility functions and helpers
  /integrations   - Third-party service integrations
  /data           - Static data and constants
  /assets         - Images, fonts, and other static assets
```

## Path Aliases

- Use `@/*` to import from the `src/` directory (e.g., `import { Button } from "@/components/ui/button"`)

## Development Commands

### Setup
```bash
npm install        # Install dependencies
```

### Development
```bash
npm run dev        # Start dev server on port 8080 (custom port configuration)
npm run preview    # Preview production build
```

### Build
```bash
npm run build      # Production build
npm run build:dev  # Development build
```

### Code Quality
```bash
npm run lint       # Run ESLint
npm test           # Run tests with bun
```

## Coding Standards

### TypeScript
- TypeScript strict mode is **relaxed** in this project:
  - `strict: false`
  - `noImplicitAny: false`
  - `noUnusedParameters: false`
  - `noUnusedLocals: false`
  - `noFallthroughCasesInSwitch: false`
- Use TypeScript for all new files (`.tsx` for components, `.ts` for utilities)
- Prefer interfaces over types for object shapes

### ESLint
- Follow the configured ESLint rules
- `@typescript-eslint/no-unused-vars` is disabled
- React Hooks rules are enforced
- Use React Refresh best practices

### React Components
- Use functional components with hooks
- Prefer named exports for components
- Use shadcn-ui components from `@/components/ui/` when available
- Follow React Hook naming conventions (`use*`)

### Styling
- Use Tailwind CSS utility classes
- Leverage `tailwind-merge` (`cn` utility) for conditional classes
- Use `class-variance-authority` for component variants
- Follow shadcn-ui theming patterns

### File Organization
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use the `@/lib/utils` for shared utility functions
- Group related components in subdirectories

## Environment Variables

Environment variables are prefixed with `VITE_` and defined in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project identifier

## Supabase Integration

- Supabase client is configured in `/src/integrations/supabase/client.ts`
- Use React Query hooks for data fetching
- Follow established patterns in `/src/integrations/supabase/` for database operations

## Testing

- Tests are run using bun (`npm test`)
- Write tests for new features and bug fixes
- Place test files adjacent to the code they test (e.g., `Button.test.tsx` next to `Button.tsx`)

## Git Workflow

- This project is integrated with Lovable.dev
- Changes made via Lovable are automatically committed
- Manual commits should follow conventional commit format when possible
- Keep commits focused and atomic

## Key Dependencies Notes

- **shadcn-ui**: Components are copied into the project, not installed as a package
- **Radix UI**: Provides accessible primitives for UI components
- **React Query**: Handles server state, caching, and data synchronization
- **Zod**: Schema validation for forms and API responses

## Common Tasks

### Adding a new page
1. Create component in `/src/pages/`
2. Add route in the router configuration
3. Update navigation if needed

### Adding a new UI component
1. Check if shadcn-ui has the component (`npx shadcn@latest add <component>`)
2. If not available, create in `/src/components/`
3. Use Radix UI primitives for accessibility

### Working with forms
1. Use React Hook Form with Zod resolver
2. Define Zod schema for validation
3. Use shadcn-ui form components for consistent styling

### Database operations
1. Define queries/mutations in `/src/integrations/supabase/`
2. Use React Query hooks for data fetching
3. Handle loading and error states appropriately

## Best Practices

1. **Accessibility**: Use semantic HTML and ARIA attributes
2. **Performance**: Lazy load routes and heavy components
3. **Type Safety**: Leverage TypeScript, even with relaxed rules
4. **Error Handling**: Always handle errors gracefully with user feedback
5. **Responsive Design**: Use Tailwind's responsive utilities (`sm:`, `md:`, `lg:`)
6. **Code Reuse**: Extract common patterns into hooks and utilities
7. **Component Composition**: Build complex UIs from simple, composable components

## Things to Avoid

- Don't bypass TypeScript types with `any` unnecessarily
- Don't modify `node_modules/` or installed packages
- Don't commit sensitive data or API keys
- Don't create duplicate components that shadcn-ui already provides
- Don't ignore ESLint warnings without good reason
- Don't make breaking changes to the Supabase schema without coordination

## When Making Changes

1. Run `npm run lint` to check for issues
2. Test your changes with `npm run dev`
3. Build the project with `npm run build` to ensure no build errors
4. Run tests with `npm test` if applicable
5. Review the diff to ensure only intended changes are included
