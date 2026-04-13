// ─── Mock Toggle ─────────────────────────────────────────────────────────────
// Set to `true`  → pages fetch from local mock JSON files (no API needed)
// Set to `false` → pages fetch from the real backend API
// ─────────────────────────────────────────────────────────────────────────────
export const USE_MOCK = false;

// ─── Details Page Mock Toggle ────────────────────────────────────────────
// Set to `true`  → DetailsPage uses recordDetails.json (new format mock)
// Set to `false` → DetailsPage fetches from the real API (old format, auto-transformed)
// ─────────────────────────────────────────────────────────────────────────────
export const USE_MOCK_DETAILS = false;

// ─── API Base URL ─────────────────────────────────────────────────────────────
// Fetched from .env (VITE_API_URL)
// ─────────────────────────────────────────────────────────────────────────────
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").trim() || "http://localhost:8000";
