# MetaDrop (MMADSC)

## Environment

1. Copy `.env.example` to `.env` and set `VITE_SUPABASE_*` for local dev and production builds.
2. Do not commit `.env`. Supabase **anon** keys are safe for `VITE_*` (they ship to the browser); **service_role** and Paystack/API secrets belong only in Supabase Edge secrets or your host’s env—not in `VITE_*` or this repo.

See security review notes in commit messages when rotating keys after removing tracked env files.
