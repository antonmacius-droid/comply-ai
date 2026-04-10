# Changelog

## [0.2.0] - 2026-04-10

### Added
- **NextAuth authentication** — Google OAuth + credentials provider, JWT sessions, middleware protection
- **Real API routes** — all 9 endpoints wired to services (was hardcoded mocks)
- **Real dashboard** — all 9 pages fetch from APIs (was mock data)
- **Drizzle/Postgres support** — registry, risk assessment, and incident services optionally use Drizzle
- **Bulwark AI v0.2.0 integration** — real API client matching admin endpoints, sync job
- **Docker worker** — worker.ts entry point for BullMQ background jobs
- **Auth helpers** — getOrgId(), getUserId() for API routes
- **Session provider** — root layout wraps app in SessionProvider
- **Sign-in page** — /auth/signin with Google + email/password

### Fixed
- DB connection no longer crashes app when DATABASE_URL is unset
- Monitoring check type enum expanded (3 → 11 types)
- Conformity checklist status aligned with DB enum
- Duplicate GitHub issues closed

### Changed
- Services are now async (return Promises)
- API routes use real service functions instead of mock arrays

## [0.1.0] - 2026-04-04

### Added
- Initial release
- EU AI Act risk classifier (@comply-ai/core)
- Annex III categories, prohibited practice checks
- Model card schema, generator, validator
- CLI with classify, check, register, status commands
- Web dashboard (Next.js 15) with 9 pages
- Drizzle schema (11 tables)
- BullMQ job infrastructure
- Docker + Docker Compose
- Landing page and documentation
