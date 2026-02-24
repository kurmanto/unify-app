# Unify App

## Project Overview
Unify App — practice management for Unify Rolfing Structural Integration (Toronto, Canada).
Handles booking, payments, client management, SOAP notes, Ten Series tracking, intake forms, marketing campaigns, and business analytics.

## Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database/Auth:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **UI:** Tailwind CSS + shadcn/ui
- **Payments:** Stripe (online) + Square (in-person)
- **AI:** Deepgram (transcription) + Anthropic Claude (SOAP structuring)
- **Email:** Resend
- **Calendar:** Google Calendar API
- **Hosting:** Vercel + Supabase Cloud

## Project Structure
```
unify-app/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, callback
│   │   ├── (dashboard)/     # All authenticated pages
│   │   │   ├── dashboard/   # Today's view
│   │   │   ├── calendar/    # Weekly calendar
│   │   │   ├── clients/     # Client list + [id] detail
│   │   │   ├── appointments/# Appointment list + [id] detail
│   │   │   ├── notes/       # SOAP note editor [id]
│   │   │   ├── forms/       # Form templates & submissions
│   │   │   ├── campaigns/   # Email campaigns + [id] editor
│   │   │   ├── analytics/   # Business dashboard
│   │   │   └── settings/    # General, schedule, services, integrations
│   │   ├── api/             # API routes
│   │   └── embed/           # Embeddable booking widget
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── appointments/    # Appointment dialog, actions
│   │   └── clients/         # Client dialog
│   ├── lib/
│   │   ├── supabase/        # Client, server, middleware
│   │   ├── ai/              # Transcribe, SOAP generator
│   │   ├── rolfing/         # Ten Series, techniques, guides
│   │   └── *.ts             # Stripe, Square, email, calendar-sync
│   ├── types/               # TypeScript types
│   └── middleware.ts         # Auth middleware
├── supabase/migrations/      # Database schema + RLS
└── docs/                     # Project documentation
```

## Database Tables
practitioners, clients, session_types, series, appointments, soap_notes, intake_forms, campaigns, campaign_recipients, documents, payments

## Key Patterns
- Server Components for data fetching, Client Components for interactivity
- Supabase RLS policies enforce data isolation per practitioner
- API routes use `createClient()` from `@/lib/supabase/server`
- Client components use `createClient()` from `@/lib/supabase/client`
- Widget API routes use service role key (public access)

## Appointment Status Machine
requested → confirmed → checked_in → completed
requested → cancelled
confirmed → cancelled | no_show

## Best Practices

### Code Quality
- Write clear, readable code — prefer clarity over cleverness
- Keep functions small and focused on a single responsibility
- Use meaningful variable and function names
- Avoid premature abstractions

### Git Workflow
- Use descriptive commit messages that explain *why*, not just *what*
- Branch naming: `feature/`, `fix/`, `chore/` prefixes

### Security
- Never commit secrets, API keys, or credentials
- Use `.env.local` for local configuration (in `.gitignore`)
- All tables have RLS policies — never bypass without explicit reason
- Payment card data never touches our servers (Stripe/Square tokenization)

## Architecture Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-23 | Project initialized | — |
| 2026-02-23 | Next.js 16 App Router | SSR + API routes, Vercel deployment |
| 2026-02-23 | Supabase (PostgreSQL + Auth) | RLS, real-time, file storage, Canadian region |
| 2026-02-23 | shadcn/ui | Accessible, customizable, Tailwind-native |
| 2026-02-23 | iframe booking widget | Simpler than Shadow DOM, framework-agnostic |
| 2026-02-23 | Deepgram + Claude for SOAP | Best transcription + AI structuring |

## Common Commands
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
```
