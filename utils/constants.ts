// Google OAuth constants.
//
// Env var names follow the README. GOOGLE_CLIENT_ID is accepted as a legacy
// fallback for the web client id so existing local setups keep working.
// Values are intentionally `string | undefined` — callers must handle a
// missing value gracefully instead of crashing at sign-in time.
//
// NOTE: GOOGLE_CLIENT_SECRET is deliberately NOT read here. A client secret
// must never ship inside a client app, and the value previously committed in
// .env is exposed (see the README security note) and must be rotated in the
// Google Cloud console.
export const GOOGLE_WEB_CLIENT_ID =
  process.env.GOOGLE_WEB_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;

export const IOS_CLIENT_ID = process.env.IOS_CLIENT_ID;

// Environment constants
export const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;

export const ACCESS_TOKEN_KEY = "access_token";
export const JOBS_STORAGE_KEY = "jobtracker_jobs";
