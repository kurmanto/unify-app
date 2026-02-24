# Changelog

## 2026-02-23 — Initial Foundation

### Added
- Complete Next.js 15 project with TypeScript, Tailwind CSS, shadcn/ui
- Supabase database schema with 12 tables and comprehensive RLS policies
- Authentication system with Supabase Auth (email/password)
- Responsive dashboard layout with sidebar navigation
- Client management (CRUD, health history, series tracking, tags)
- Appointment system with status machine (requested → confirmed → checked_in → completed → cancelled)
- Weekly calendar view with appointment grid
- SOAP note editor with Rolfing Ten Series session guide sidebar
- Voice dictation stub (Deepgram API integration)
- AI SOAP note generation (Claude API integration)
- Settings pages: schedule config, services/pricing, integrations
- Forms management page with templates
- Campaign management with email editor
- Analytics dashboard with revenue, client, and session metrics
- Embeddable booking widget (iframe-based)
- Payment API routes for Stripe and Square
- Stripe webhook handler for payment status updates
- Widget API routes for availability checking and booking
- Email utility functions (Resend integration)
- Complete Rolfing Ten Series protocol data (all 10 sessions)
- Technique reference library (12 techniques)
- Session guides with goals, anatomy, philosophy, and client descriptions
- TypeScript types for all database entities
- Project documentation (spec, status, changelog)
