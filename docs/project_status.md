# Unify App — Project Status

## Current Phase: Foundation Complete

### Completed
- [x] Next.js 15 project initialization (App Router, TypeScript, Tailwind, shadcn/ui)
- [x] Supabase database schema (12 tables with full CRUD)
- [x] Row Level Security (RLS) policies on all tables
- [x] Authentication system (Supabase Auth + middleware)
- [x] Dashboard layout (responsive sidebar + header)
- [x] Dashboard home page with today's schedule
- [x] Client management (list, detail, CRUD, health history, series tracking)
- [x] Appointment system (list, detail, status machine, CRUD)
- [x] Calendar view (weekly grid with appointments)
- [x] SOAP notes editor with session guide sidebar
- [x] Settings pages (general, schedule, services/pricing, integrations)
- [x] Forms management page
- [x] Campaign management (list, editor)
- [x] Analytics dashboard (revenue, clients, sessions)
- [x] Embeddable booking widget (iframe-based)
- [x] API routes: clients, appointments, notes, transcribe, payments (Stripe/Square/webhook), campaigns, calendar-sync, widget availability/book
- [x] Rolfing Ten Series protocol engine (all 10 sessions)
- [x] Technique reference library
- [x] Session guides with client-facing descriptions
- [x] AI integration (Deepgram transcription + Claude SOAP structuring)
- [x] Email utilities (Resend integration)
- [x] TypeScript types for all database entities
- [x] Build passes successfully (30 routes)

### Next Steps
- [ ] Connect to actual Supabase project (set .env.local)
- [ ] Create initial practitioner account
- [ ] Seed default session types (Initial, Subsequent, Ten Series Package, Consultation)
- [ ] Set up Stripe test mode integration
- [ ] Set up Square sandbox integration
- [ ] Configure Resend for transactional emails
- [ ] Set up Google Calendar OAuth
- [ ] Configure Deepgram API for voice transcription
- [ ] Build standalone widget bundle (rollup/vite)
- [ ] Deploy to Vercel (Canadian region)
- [ ] End-to-end testing of booking flow
- [ ] Mobile viewport testing and refinement

### Architecture Decisions
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-23 | Next.js 16 App Router | SSR + API routes in one deployment |
| 2026-02-23 | Supabase for auth + DB | RLS for data security, real-time, storage |
| 2026-02-23 | shadcn/ui components | Accessible, customizable, Tailwind-native |
| 2026-02-23 | iframe-based booking widget | Simpler than Shadow DOM, works everywhere |
| 2026-02-23 | Deepgram + Claude for SOAP | Best-in-class transcription + structuring |
