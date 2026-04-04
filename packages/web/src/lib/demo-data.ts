/**
 * Demo/mock data toggle.
 *
 * Set NEXT_PUBLIC_DEMO_MODE=false in .env.local to start with empty state.
 * Default: true (shows demo data for evaluation).
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
