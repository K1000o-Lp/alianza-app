# Copilot Instructions for alianza-app

## Project Overview
**alianza-app** is a React + TypeScript + Vite application for member and activity management. It uses Redux Toolkit with RTK Query for state and API management, Material-UI for components, and React Router v6 for navigation.

**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool with HMR)
- Redux Toolkit + RTK Query (state management & caching)
- Material-UI v6 (@mui/material, @mui/x-data-grid, @mui/x-date-pickers)
- React Router v6
- React Hook Form (form handling)
- dayjs (date manipulation)

## Architecture

### State Management (Redux + RTK Query)
- **Location:** `src/redux/`
- **Pattern:** RTK Query for API caching with invalidation via tags
- **Key Files:**
  - `store.ts` - Store config with alianzaApi middleware
  - `features/authSlice.ts` - Auth state (user, isLogged)
  - `services/api.ts` - API endpoints with tag-based cache invalidation

**RTK Query Tags:** Zones, Services, Members, Results, Statistics, Supervisors, etc.

### Routing & Authentication
- **Location:** `src/router/`
- **Pattern:** Private routes wrapped in `PrivateRoute` component with Layout
- **Main Routes:** Home, Miembros (list/create/edit), Eventos, Asistencias, Reportes, Supervisores
- **Auth Flow:** Login stores JWT in localStorage, decoded to set user in Redux

### Pages Structure
Each page follows: `pages/[PageName]/view/[PageName].tsx` (main component) + `components/` (sub-components)
- Pages: Home, Miembros, AddMember, EditMember, Eventos, Asistencias, ReportesConsolidaciones, Supervisores, SignIn

### Layout
- **Location:** `src/layout/`
- **Pattern:** ResponsiveAppBar + DrawerMenu + NavList
- Wraps all authenticated routes

## Key Conventions

### API Calls
- Use RTK Query hooks from `redux/services/api.ts` (e.g., `useGetMembersWithResultsAndPaginationQuery()`)
- Always provide proper **invalidate tags** in mutations for cache invalidation
- Base URL from `.env`: `VITE_BACKEND_URL`

### Forms
- Use **React Hook Form** for form handling
- Types defined in `src/types/index.ts` (e.g., `MemberForm`, `EventForm`)
- Forms validate against these typed interfaces

### Types & Interfaces
- **Location:** `src/types/index.ts`
- Core types: User, Zone, Service, ResponseMember, MemberForm, EventForm, etc.
- Always extend/match existing type definitions

### Environment Variables
- **Location:** `.env`
- **Development:** `VITE_BACKEND_URL=http://localhost:3000/api/`
- **Zone:** `VITE_ZONA_0=13`
- Access via `config()` helper in `src/config/index.ts`

### Helpers
- **Location:** `src/helpers/`
- Examples: `obtenerEdad()` (calculate age), `calcularPageParam()` (pagination)
- Use existing helpers to maintain consistency

## Development Workflow

### Build & Run
```bash
npm run dev      # Start dev server with HMR
npm run build    # TypeScript + Vite build
npm run lint     # ESLint with max-warnings 0
npm run preview  # Preview production build
```

### TypeScript Config
- `tsconfig.json` - Main config
- `tsconfig.node.json` - Node/Vite config
- Module: ES2020, strict mode enabled

### Code Splitting
Vite configured with manual chunks:
- `react` chunk: React, React-Router, Redux
- `materialUi` chunk: MUI + data grid + date pickers

## Component Patterns

### Layout & Pages
- All authenticated pages wrapped in `<Layout>` with `<PrivateRoute>`
- Use `<Container maxWidth="xl">` for consistent padding

### Material-UI
- Use `sx` prop for styling (Emotion-based)
- Responsive components: `<DataGrid>`, `<DatePicker>`, `<IconButton>`
- Theme-aware colors via `theme.palette`

### Redux Hooks
- Use custom hooks: `useAppDispatch()`, `useAppSelector()`
- Located in `store.ts` for type safety

## Common Tasks

### Add a New API Endpoint
1. Add endpoint in `src/redux/services/api.ts` using RTK Query builder
2. Add appropriate tag types if not existing
3. Export hook (auto-generated)
4. Use in component with `useYourEndpointQuery()` or `useYourEndpointMutation()`

### Add a New Page
1. Create folder: `src/pages/[PageName]/view/` + `components/`
2. Add route in `src/router/routes/MainRoute.tsx`
3. Import page and add route object
4. Create form types in `src/types/index.ts` if needed

### Form Submission
1. Use React Hook Form `useForm()` hook
2. Validate against type interface
3. Call RTK Query mutation hook
4. Handle `isLoading`, `error`, `data` states

## Important Notes
- **No breaking changes to types:** Always extend existing types, don't modify them
- **Cache invalidation:** Always specify `invalidatesTags` in mutations
- **Error handling:** Use RTK Query error states (FetchBaseQueryError)
- **Pagination:** Use `infiniteQueryOptions` pattern for infinite queries (see api.ts)
- **Date handling:** Use `dayjs` consistently (not native Date)
