# User Synchronization Dashboard

## Assignment Overview

**Role:** Senior Full Stack Engineer
**Time Allotment:** 1–2 Days
**Core Stack:** Next.js (TypeScript), PostgreSQL
**Deliverable:** Public GitHub repository with a complete, runnable application

### Brief

Build a feature that simulates synchronizing new user data with an external partner system (like a CRM), demonstrating proficiency across the full stack — database interaction, API development, and a strong user experience.

---

## Tech Stack & Architectural Choices

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **Next.js 16** (App Router) | Latest stable version; file-based routing, server components, and built-in API routes eliminate boilerplate |
| Language | **TypeScript** (strict mode) | End-to-end type safety via shared `ApiResponse<T>` and `User` types across API and UI |
| Database | **Supabase** (managed PostgreSQL) | Zero-config hosted Postgres with a JS SDK; avoids local DB setup friction while fulfilling the PostgreSQL requirement |
| Data Fetching | **TanStack React Query v5** | Declarative cache management, automatic re-fetches after mutations, and built-in loading/error states |
| Styling | **Tailwind CSS v4** | Utility-first CSS with dark mode support; fast iteration without context-switching to style files |
| Runtime | **React 19** | Latest concurrent features; pairs with Next.js 16 for streaming and Server Components |
| Package Manager | **pnpm** | Fast, disk-efficient installs with strict dependency resolution |

### Why Supabase over raw `pg` / Prisma?

- **Managed PostgreSQL** — the assignment asks for a PostgreSQL database; Supabase provides exactly that with zero ops overhead.
- **Row Level Security** — enabled out of the box for the demo, making it trivial to lock down in production.
- **SDK simplicity** — `@supabase/supabase-js` provides a typed query builder that maps cleanly to SQL without the weight of an ORM.
- Trade-off: the Supabase SDK abstracts raw SQL. The seed file (`supabase/seed.sql`) demonstrates direct PostgreSQL DDL/DML proficiency.

---

## Requirements Checklist

### 1. Database Setup (PostgreSQL) ✅

**Table: `users`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | Primary Key, default `uuid_generate_v4()` |
| `name` | `TEXT` | NOT NULL |
| `email` | `TEXT` | UNIQUE, NOT NULL |
| `synced_at` | `TIMESTAMPTZ` | Nullable |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` |

**Seed data** — 5 sample users (3 with `synced_at = NULL`, 2 already synced). See [`supabase/seed.sql`](../supabase/seed.sql).

Row Level Security is enabled with an open policy for demo purposes.

### 2. Front-end (Next.js / TypeScript) ✅

- **Dashboard route:** The app renders the dashboard at `/` (the root route). The `page.tsx` mounts the `<Dashboard />` component.
- **User table** displays every user's **name**, **email**, and **sync status** via a color-coded badge (`Synced` / `Pending`).
- **"Sync" button** appears for any user with a `null` `synced_at` value — per-row, inline with the user data.
- **"Sync All" button** batch-syncs every unsynced user in one API call.
- **"Unsync All" button** resets all users back to pending (useful for demo/testing).
- **"Add User" form** allows creating new users inline without leaving the page.
- **Stats strip** shows total / synced / pending counts at a glance.

### 3. Backend (Next.js API Routes) ✅

| Endpoint | Method | Purpose | Simulated Delay |
|----------|--------|---------|-----------------|
| `GET /api/users` | GET | Fetch all users | — |
| `POST /api/users` | POST | Create a new user | — |
| `POST /api/users/:id/sync` | POST | Sync a single user by ID | **800 ms** |
| `POST /api/users/sync` | POST | Sync all unsynced users | **1 500 ms** |
| `POST /api/users/unsync` | POST | Reset all synced users | 600 ms |

Each endpoint:
- Accepts input via URL params (`id`) or JSON body (`name`, `email`).
- **Simulates an external API call** with an artificial `setTimeout` delay.
- Updates the `synced_at` column to the current timestamp on success.
- Returns a strongly typed `ApiResponse<T>` with either `data` or `error`.
- Handles edge cases: missing user (404), already-synced user (idempotent return), validation errors (400), and unexpected failures (500).

### 4. Integration & UX ✅

- **Loading states:** Spinner animations on all buttons during API calls; buttons are disabled to prevent double-submission.
- **Optimistic feedback:** React Query invalidates the `["users"]` cache on mutation success, triggering an automatic re-fetch so the UI updates immediately.
- **Error banners:** Sync/unsync failures display inline error messages with red styling.
- **Success banners:** After bulk sync/unsync, a green banner confirms the count of affected users.
- **Dark mode:** Full dark-mode support via Tailwind's `dark:` variants.
- **Responsive layout:** The dashboard adapts from mobile to desktop with flex-wrap and responsive padding.

---

## Project Structure

```
user-sync-dashboard/
├── app/
│   ├── layout.tsx              # Root layout — fonts, QueryProvider
│   ├── page.tsx                # Dashboard entry point
│   ├── globals.css             # Tailwind v4 base styles
│   └── api/
│       └── users/
│           ├── route.ts        # GET (list) + POST (create)
│           ├── [id]/
│           │   └── sync/
│           │       └── route.ts  # POST — sync single user
│           ├── sync/
│           │   └── route.ts      # POST — sync all
│           └── unsync/
│               └── route.ts      # POST — unsync all
├── components/
│   ├── dashboard.tsx           # Main orchestrator component
│   ├── user-table.tsx          # Table with stats strip
│   ├── user-row.tsx            # Individual row + sync button
│   ├── sync-status-badge.tsx   # Synced / Pending badge
│   ├── sync-all-button.tsx     # Bulk sync CTA
│   ├── unsync-all-button.tsx   # Bulk unsync CTA
│   └── add-user-form.tsx       # Inline user creation form
├── lib/
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── hooks/
│   │   └── use-users.ts        # React Query hooks (queries + mutations)
│   ├── providers/
│   │   └── query-provider.tsx  # QueryClientProvider wrapper
│   └── supabase/
│       ├── client.ts           # Browser-side Supabase singleton
│       └── server.ts           # Server-side Supabase factory
├── supabase/
│   └── seed.sql                # DDL + seed data
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Key Design Decisions

### Type-safe API contract

A single `ApiResponse<T>` generic covers every endpoint, ensuring the client always receives `{ data: T | null, error: string | null }`. The React Query hooks in `use-users.ts` parse this contract and throw on errors, so the UI can rely on standard `isLoading` / `isError` / `data` states.

### Separation of concerns

- **API routes** handle only data access and business logic (validation → simulate delay → DB write → response).
- **React Query hooks** encapsulate all fetch/mutate logic and cache invalidation.
- **Components** are purely presentational — they receive data and callbacks via props with no direct API knowledge (except `Dashboard`, which wires everything together).

### Supabase client split

- `lib/supabase/client.ts` — Browser singleton, used if client-side direct access is ever needed.
- `lib/supabase/server.ts` — Factory function for API routes; creates a fresh client per request to avoid cross-request state leakage in serverless environments.

### Idempotent sync

The single-user sync endpoint checks whether `synced_at` is already set. If so, it returns the user as-is without re-syncing — preventing unnecessary external API calls in a real integration.

---

## Setup & Running

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (or npm/yarn)
- A **Supabase** project (free tier works) — or any PostgreSQL instance accessible via Supabase SDK

### Steps

```bash
# 1. Clone the repository
git clone <repo-url> && cd user-sync-dashboard

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
#    Create a .env.local file at the project root:
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# 4. Set up the database
#    Run the contents of supabase/seed.sql in the Supabase SQL Editor
#    (or via psql / any PostgreSQL client)

# 5. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## AI Tool Usage (Bonus Reflection)

AI tools (GitHub Copilot / Claude) were used throughout this project to **accelerate development** without replacing critical decision-making:

- **Scaffolding:** Generated initial boilerplate for API route handlers and React Query hooks, significantly reducing setup time.
- **Type definitions:** AI suggested the `ApiResponse<T>` generic pattern after describing the desired API contract, saving iteration on the type design.
- **Tailwind styling:** Copilot autocompleted complex utility class strings (dark mode variants, ring styles, responsive breakpoints) faster than manual lookup.
- **SQL seed file:** The DDL and seed `INSERT` statements were drafted with AI assistance and then reviewed for correctness (e.g., `ON CONFLICT` clause, `TIMESTAMPTZ` vs `TIMESTAMP`).
- **Edge-case handling:** Prompted the AI to enumerate failure modes (missing user, duplicate email, already-synced), which led to the idempotent sync check and proper 400/404/500 responses.

**Where human judgment was essential:** Architecture decisions (Supabase vs raw pg, React Query vs SWR, component decomposition), security considerations (RLS policies), and UX flow design were all made by the developer — AI served as a productivity multiplier, not a decision-maker.
