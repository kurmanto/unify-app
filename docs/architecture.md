# Unify App — Architecture

## Overview

Unify is a practice management application for Unify Rolfing Structural Integration (Toronto, Canada). It handles booking, payments, client management, SOAP notes, Ten Series tracking, intake forms, email campaigns, and business analytics — all through a single-practitioner web interface plus an embeddable booking widget for the public-facing website.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router, TypeScript) | SSR + API routes, Vercel-native deployment |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) | RLS for data isolation, real-time, Canadian region |
| UI | Tailwind CSS 4 + shadcn/ui | Accessible, customizable, Tailwind-native |
| Online Payments | Stripe | PaymentIntent API, card tokenization |
| In-Person Payments | Square | REST API, terminal integration |
| Transcription | Deepgram (Nova-2) | Best-in-class speech-to-text with smart formatting |
| AI Structuring | Anthropic Claude (Sonnet) | Converts transcripts into structured SOAP notes |
| Email | Resend | Transactional email and campaign delivery |
| Calendar | Google Calendar API | Two-way appointment sync (OAuth) |
| Hosting | Vercel + Supabase Cloud | Edge functions, automatic previews |

---

## Directory Structure

```
unify-app/
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Unauthenticated routes
│   │   │   ├── login/page.tsx       # Email/password login
│   │   │   └── callback/route.ts    # Supabase auth code exchange
│   │   ├── (dashboard)/             # Authenticated routes (shared layout)
│   │   │   ├── layout.tsx           # Sidebar + Header shell
│   │   │   ├── dashboard/           # Today's overview
│   │   │   ├── calendar/            # Weekly calendar view
│   │   │   ├── clients/             # Client list + [id] detail
│   │   │   ├── appointments/        # Appointment list + [id] detail
│   │   │   ├── notes/[id]/          # SOAP note editor
│   │   │   ├── forms/               # Form templates & submissions
│   │   │   ├── campaigns/[id]/      # Email campaign editor
│   │   │   ├── analytics/           # Business dashboard
│   │   │   └── settings/            # General, schedule, services, integrations
│   │   ├── api/                     # API routes (see below)
│   │   ├── embed/                   # Public embeddable booking widget
│   │   ├── globals.css              # CSS custom properties (color palette)
│   │   └── layout.tsx               # Root layout (fonts, metadata)
│   ├── components/
│   │   ├── ui/                      # 26 shadcn/ui primitives
│   │   ├── appointments/            # AppointmentDialog, AppointmentActions
│   │   ├── clients/                 # ClientDialog
│   │   ├── sidebar.tsx              # Desktop + mobile sidebar navigation
│   │   └── header.tsx               # Top bar with avatar dropdown
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser Supabase client (SSR cookies)
│   │   │   ├── server.ts            # Server component Supabase client
│   │   │   └── middleware.ts        # Session refresh helper
│   │   ├── ai/
│   │   │   ├── transcribe.ts        # Deepgram Nova-2 integration
│   │   │   └── soap-generator.ts    # Claude SOAP structuring
│   │   ├── rolfing/
│   │   │   ├── ten-series.ts        # Full Ten Series curriculum data
│   │   │   ├── techniques.ts        # 12 Rolfing technique definitions
│   │   │   └── session-guides.ts    # Per-session practitioner guides
│   │   ├── stripe.ts                # Currency formatting, HST calculation
│   │   ├── square.ts                # Environment config, base URL
│   │   ├── email.ts                 # Resend templates (confirmations, reminders)
│   │   ├── calendar-sync.ts         # Google Calendar event builder
│   │   └── utils.ts                 # cn() classname merger
│   ├── types/index.ts               # All TypeScript types and enums
│   └── middleware.ts                # Auth guard (redirects to /login)
├── supabase/
│   └── migrations/                  # SQL schema, indexes, RLS policies
├── docs/                            # Project documentation
└── public/                          # Static assets
```

---

## Database Schema

### Entity Relationship Diagram (logical)

```
practitioners ──┬── clients ──┬── series
                │             ├── appointments ── soap_notes
                │             ├── intake_forms
                │             ├── documents
                │             └── payments
                ├── session_types
                ├── campaigns ── campaign_recipients ── clients
                └── (auth.users via id)
```

### Tables

| Table | Key Columns | Notes |
|-------|-------------|-------|
| **practitioners** | id (FK → auth.users), business_name, timezone, schedule_config (JSONB), stripe_account_id, square_location_id | One row per practitioner, linked to Supabase Auth |
| **clients** | practitioner_id, first/last name, email, phone, dob, address (JSONB), emergency_contact (JSONB), health_history (JSONB), tags[], intake_completed | Tags used for campaign segmentation |
| **session_types** | practitioner_id, name, duration_minutes, price_cents, tax_rate, is_package, package_sessions | Price stored in cents to avoid floating point |
| **series** | practitioner_id, client_id, type (ten_series\|custom), total_sessions, current_session, status | Tracks Ten Series or custom series progress |
| **appointments** | practitioner_id, client_id, session_type_id, series_id?, starts_at, ends_at, status, payment_status, payment_processor, payment_id, external_calendar_id, notes | Central scheduling entity |
| **soap_notes** | appointment_id (unique), subjective, objective, assessment, plan, transcript, focus_areas (JSONB), techniques_used, session_goals, pre_session_notes | One note per appointment, AI-assisted |
| **intake_forms** | practitioner_id, client_id, type, form_data (JSONB), signature_url, signed_at | Types: intake, health_history, consent, cancellation_policy, custom |
| **campaigns** | practitioner_id, subject, body, status, segment_tags[], scheduled_for, sent_at | Email marketing with client segmentation |
| **campaign_recipients** | campaign_id, client_id, sent_at, opened_at, clicked_at | Per-recipient tracking for analytics |
| **documents** | practitioner_id, client_id, type, file_path, file_name, file_size | Stored in Supabase Storage |
| **payments** | practitioner_id, client_id, appointment_id?, processor, processor_payment_id, amount_cents, tax_cents, total_cents, status, paid_at | Financial record of all transactions |

### Row Level Security

Every table has RLS enabled. Policies enforce that practitioners can only access rows where `practitioner_id` matches the authenticated user's ID. The one exception is `session_types`, which has a public read policy so the booking widget can fetch available services.

---

## Appointment Status Machine

```
requested ──→ confirmed ──→ checked_in ──→ completed
    │              │
    └── cancelled  └── cancelled
                   └── no_show
```

Payment statuses: `pending` → `paid` | `partially_paid` | `refunded` | `failed`

---

## API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/appointments` | GET, POST | Yes | List with relations / create appointment |
| `/api/clients` | GET, POST | Yes | List with search / create client |
| `/api/notes` | GET, POST | Yes | Fetch / save SOAP notes |
| `/api/notes/transcribe` | POST | Yes | Deepgram transcription → Claude SOAP structuring |
| `/api/payments/stripe` | POST | Yes | Create Stripe PaymentIntent |
| `/api/payments/square` | POST | Yes | Process Square payment |
| `/api/payments/webhook` | POST | No* | Payment processor webhooks |
| `/api/campaigns` | GET, POST | Yes | List / create email campaigns |
| `/api/calendar-sync` | POST | Yes | Sync appointment to Google Calendar |
| `/api/widget/availability` | GET | No** | Calculate available booking slots |
| `/api/widget/book` | POST | No** | Create booking from embedded widget |

\* Webhook verified by processor signature, not Supabase auth.
\** Widget routes use `SUPABASE_SERVICE_ROLE_KEY` for public access — no user session required.

---

## Key Architectural Patterns

### Server vs Client Components

```
Server Components (default)          Client Components ("use client")
─────────────────────────────        ─────────────────────────────────
• Page-level data fetching           • Forms and interactive UI
• Direct Supabase queries            • Modals / dialogs
• No JS shipped to browser           • State management (useState, etc.)
• Can't use hooks or events          • Event handlers (onClick, onChange)
```

Pages are server components that fetch data directly from Supabase. Interactive elements (dialogs, forms, dropdowns) are client components imported into server pages.

### Data Flow

```
Browser ──→ Server Component ──→ Supabase (via server client)
Browser ──→ Client Component ──→ Supabase (via browser client)
Browser ──→ API Route ──→ External Service (Stripe, Deepgram, etc.)
External ──→ API Route (webhook) ──→ Supabase (update payment status)
Public site ──→ iframe (/embed) ──→ Widget API routes ──→ Supabase (service role)
```

### Auth Flow

1. User submits email/password on `/login`
2. Supabase client authenticates and sets session cookies
3. `middleware.ts` intercepts every request:
   - Public paths (`/login`, `/callback`, `/embed`, `/api/widget`) pass through
   - All others: refresh session, redirect to `/login` if no user
4. `/callback` exchanges OAuth code for session (used for Google Calendar OAuth)

### Payment Security

Card data never touches the server. Both Stripe and Square use client-side tokenization. The server only creates payment intents / processes tokens and records results in the `payments` table.

---

## Booking Widget

The widget is an embeddable booking flow served at `/embed?practitioner=<UUID>` and designed to be loaded in an iframe on the practitioner's public website.

**Flow:**
1. Fetch session types (public read via RLS)
2. User selects a session type
3. User picks a date → API calculates available slots
4. User picks a time slot
5. User enters contact info (name, email, phone)
6. Review and confirm → creates client (if new) + appointment
7. Success confirmation

**Availability Calculation:**
- Reads practitioner's `schedule_config` JSONB (day-by-day hours, breaks, buffer minutes)
- Gets session duration from selected `session_type`
- Excludes existing appointments + buffer time on each side
- Returns 30-minute interval slots

---

## AI Pipeline (SOAP Notes)

```
Audio recording (browser)
    │
    ▼
Deepgram Nova-2 (transcribe.ts)
    │  → transcript text + word-level timestamps + confidence
    ▼
Claude Sonnet (soap-generator.ts)
    │  → structured JSON: { subjective, objective, assessment, plan,
    │     focus_areas, techniques_used, session_goals }
    ▼
SOAP Note editor (notes/[id]/page.tsx)
    → practitioner reviews, edits, saves
```

The AI call includes session context (session number, series phase, client history) so the SOAP output is clinically relevant and specific to Rolfing Structural Integration.

---

## Rolfing Domain Model

The `lib/rolfing/` module encodes Rolfing-specific knowledge:

- **Ten Series** (`ten-series.ts`) — 10 sessions organized into 3 phases:
  - **Sleeve** (sessions 1–3): Superficial fascia, breathing, lateral balance
  - **Core** (sessions 4–7): Deep structures, midline, visceral space
  - **Integration** (sessions 8–10): Whole-body coordination, closure
  - Each session includes goals, focus areas, anatomy, techniques, client description, and post-session guidance

- **Techniques** (`techniques.ts`) — 12 named techniques (e.g., direct myofascial release, craniosacral, visceral manipulation) with categories and common application areas

- **Session Guides** (`session-guides.ts`) — Per-session practitioner reference material

---

## Environment Variables

| Variable | Used By |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client (browser + server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Widget API routes (bypasses RLS) |
| `STRIPE_SECRET_KEY` | Stripe PaymentIntent creation |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js client-side tokenization |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `SQUARE_ACCESS_TOKEN` | Square API |
| `SQUARE_LOCATION_ID` | Square terminal location |
| `SQUARE_ENVIRONMENT` | sandbox \| production |
| `DEEPGRAM_API_KEY` | Deepgram transcription |
| `ANTHROPIC_API_KEY` | Claude SOAP generation |
| `RESEND_API_KEY` | Email delivery |
| `RESEND_FROM_EMAIL` | Sender address |
| `GOOGLE_CLIENT_ID` | Google Calendar OAuth |
| `GOOGLE_CLIENT_SECRET` | Google Calendar OAuth |
| `NEXT_PUBLIC_APP_URL` | Callback URLs, email links |

---

## Deployment

- **Application**: Vercel (automatic deploys from `main`, preview deploys from PRs)
- **Database**: Supabase Cloud (Canadian region for data residency)
- **Migrations**: Applied via Supabase CLI (`supabase db push` or migration files)
- **Environment**: Variables configured in Vercel dashboard and `.env.local` for development
