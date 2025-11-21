# API Dependency Map Analyzer

Visual explorer for OpenAPI/Swagger specs. Upload or paste a spec, then inspect endpoint-to-schema relationships, hotspots, and usage patterns in one place.

## Highlights
- **Upload or paste** OpenAPI v3 JSON/YAML (includes `public/samples/petstore.json` for a one-click demo).
- **Endpoint explorer** with search, tag chips, and detailed request/response schema lists.
- **Dependency graph** (endpoints ↔ schemas ↔ tags) rendered with ReactFlow, highlighting shared schemas.
- **Metrics + summary**: counts, schema usage, tag distribution, and quick takeaways.
- **API routes**: `POST /api/specs` to store specs, `GET /api/specs/:id` to fetch and analyze on demand.

## Quickstart
1) Install deps  
```bash
npm install
```
2) Environment  
Ensure `.env` contains `DATABASE_URL="file:./dev.db"` (already scaffolded).

3) Prisma client  
```bash
npx prisma generate
```
4) Database schema  
Prefer migrations when available:  
```bash
npx prisma migrate dev --name init
```  
If migrations are unavailable in your environment, seed the table directly:  
```bash
echo 'CREATE TABLE IF NOT EXISTS "ApiSpec" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "raw" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);' \
  | npx prisma db execute --stdin --url "file:./dev.db"
```
5) Run the app  
```bash
npm run dev
```
6) Open `http://localhost:3000` and click **Use sample** or upload your own spec.

## Architecture at a glance
- **Parsing pipeline**: `lib/openapi/parseSpec.ts` (JSON/YAML → domain), `analyzeDependencies.ts` (graph), `calculateMetrics.ts` (counts/usage), `buildGraph.ts` (ReactFlow nodes/edges).
- **UI**: `components/*` (UploadSpecForm, EndpointList, DependencyGraph, MetricsPanel, AnalysisSummary, etc.).
- **Pages/APIs**: `app/api/specs/*` (persist + fetch), `app/specs/[id]/page.tsx` (analysis view), `app/page.tsx` (landing/upload).
- **Data**: `prisma/schema.prisma` defines the `ApiSpec` model stored in SQLite (via Prisma).

## Tech stack
- Next.js (App Router) + TypeScript + Tailwind CSS v4
- ReactFlow for graph visualization
- Prisma + SQLite for persistence
- YAML + `@apidevtools/swagger-parser` (validation) + custom parsing/analysis in `lib/openapi/*`
- zod for input validation

## Helpful scripts
- `npm run dev` — start the dev server  
- `npm run build` — production build  
- `npm run start` — start production server  
- `npm run lint` — run ESLint

## Roadmap ideas
- Import specs via URL (GitHub/raw Swagger links).
- Health score: redundant endpoints, oversized schemas, tight coupling flags.
- Call-flow hints (e.g., `/login -> /users/me -> /orders`).
- AuthN (OAuth) and user-owned specs.
- Export reports (Markdown/PDF).
