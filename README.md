# User Synchronization Dashboard

A full-stack Next.js application that simulates synchronizing user data with an external partner system (e.g., a CRM). Built with **Next.js 16**, **TypeScript**, **Supabase (PostgreSQL)**, and **TanStack React Query**.

## Features

- View all users with their name, email, and sync status
- Sync individual users or all unsynced users in bulk
- Unsync all users (for demo/testing)
- Add new users via an inline form
- Loading spinners, disabled buttons, and success/error banners for smooth UX
- Dark mode support

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (`npm install -g pnpm`)
- A **Supabase** project ([free tier](https://supabase.com))

### Setup

```bash
# 1. Clone & install
git clone <repo-url> && cd user-sync-dashboard
pnpm install

# 2. Configure environment
cp .env.example .env.local   # then fill in your Supabase credentials
```

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

```bash
# 3. Set up the database
#    Copy the contents of supabase/seed.sql and run it in the Supabase SQL Editor

# 4. Run the app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

### Database (Supabase / PostgreSQL)

The `users` table uses UUID primary keys, a unique email constraint, a nullable `synced_at` timestamp, and Row Level Security enabled with an open policy for demo purposes. Schema and seed data live in `supabase/seed.sql`.

### API Routes (Next.js App Router)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users` | GET | List all users |
| `/api/users` | POST | Create a user |
| `/api/users/:id/sync` | POST | Sync one user (800ms simulated delay) |
| `/api/users/sync` | POST | Sync all unsynced users (1.5s delay) |
| `/api/users/unsync` | POST | Reset all synced users |

All endpoints return a typed `ApiResponse<T>` envelope (`{ data, error }`) and include proper error handling (400/404/500).

### Client-side Data Layer

**TanStack React Query v5** manages all server state. Custom hooks in `lib/hooks/use-users.ts` encapsulate fetching, mutations, and automatic cache invalidation — the UI never calls `fetch()` directly.

### Component Hierarchy

`Dashboard` (orchestrator) → `UserTable` → `UserRow` + `SyncStatusBadge`, alongside `SyncAllButton`, `UnsyncAllButton`, and `AddUserForm`. Components are presentation-only; all data logic flows through React Query hooks.

## Detailed Documentation

See [`docs/Claude.md`](docs/Claude.md) for a comprehensive breakdown of design decisions, the full requirements checklist, and a reflection on AI tool usage.
