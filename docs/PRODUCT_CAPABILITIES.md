# MetaDrop (MMADSC) — Product capabilities

This document describes **what the shipped product does** in this repository: routes, screens, client vs server behavior, payments, report access, exports, and tier gating. Claims are grounded in file paths under `src/`, `supabase/functions/`, and `supabase/migrations/`.

**Not covered here:** generic marketing copy, legal prose (except where routes exist), and infrastructure secrets (`Deno.env` keys are referenced by name only in Edge Functions).

---

## 1. App shell and global behavior

| Item | Location | Role |
|------|----------|------|
| Router | `src/App.tsx` | `BrowserRouter` + `Routes`; wraps app in `QueryClientProvider`, `TooltipProvider`, toasters |
| Splash | `src/App.tsx`, `src/components/SplashScreen.tsx` | On first paint, full-screen logo intro until `onComplete`; then main routes render |
| Supabase client | `src/integrations/supabase/client.ts` | Browser client using `import.meta.env.VITE_SUPABASE_*` (anon key) |

There is **no email/password or OAuth “logged-in app” shell**. Access to purchased report content is by **URL reference** (Paystack reference), not by session.

---

## 2. Route map

| Path | Page component | Primary purpose |
|------|------------------|-----------------|
| `/` | `src/pages/Index.tsx` | Home: wallet address input, **client-side** eligibility preview (`analyzeWallet`), results UI (`ScoreDisplay`, `ActivityBreakdown`), pricing (`PricingSection`), payment modal (`PaymentModal`), optional email CTA (`CTASection`), legal links in footer |
| `/report/:reference` | `src/pages/Report.tsx` | **Premium report viewer**: loads persisted JSON from DB by `paystack_reference`; tier-based section visibility; in-browser PDF download |
| `/manage-subscription` | `src/pages/ManageSubscription.tsx` | Look up **Insider Weekly** subscription by email; cancel via Edge Function |
| `/terms` | `src/pages/TermsOfService.tsx` | Terms of service |
| `/privacy` | `src/pages/PrivacyPolicy.tsx` | Privacy policy |
| `*` | `src/pages/NotFound.tsx` | 404 |

---

## 3. Major UI areas (home flow, `/`)

Components used from `Index.tsx` (non-exhaustive but product-relevant):

| Area | Components | Behavior |
|------|------------|----------|
| Background | `HomeBackdrop.tsx`, `CryptoFloatLayer.tsx` | Decorative layers (aurora, grid, floating crypto symbols) |
| Analysis panel | `AnalysisInputPanel.tsx` wraps `WalletInput.tsx` | Animated “instrument” chrome; address field + submit |
| Loading state | `ScannerAnimation.tsx` | Shown while `handleCheck` awaits fixed delay before scoring |
| Results | `ScoreDisplay.tsx`, `ActivityBreakdown.tsx` | Renders `ScoringResult` from `lib/scoring.ts` |
| Monetization | `PricingSection.tsx`, `PaymentModal.tsx` | Tier selection → Paystack checkout → poll for report → navigate to `/report/:ref` |
| Email capture (results) | `CTASection.tsx` | Local state only; “subscribe” does **not** call backend in code shown |

---

## 4. Data flows

### 4.1 Free preview (home)

| Step | Mechanism | Source |
|------|-----------|--------|
| User submits `0x…` address | `WalletInput` → `Index` `handleCheck` | — |
| “Scanning” delay | `setTimeout` ~2.4s | `Index.tsx` |
| Score + activities | `analyzeWallet(address)` | `src/lib/scoring.ts` |
| Determinism | Pseudo-random stream seeded by **address string** | `pseudoRandom()` in `scoring.ts` |

**Important:** The preview is **not** a live chain fetch in the browser. It is a **deterministic simulation** (activity flags, score, tx count, etc.) derived from the address hash.

### 4.2 Paid report generation (server)

| Step | Mechanism | Source |
|------|-----------|--------|
| Initialize payment | `supabase.functions.invoke("initialize-payment", { body: { email, walletAddress, tier, amount } })` | `PaymentModal.tsx` |
| Paystack | Redirect / new window to `authorization_url`; amounts in **kobo/cents-style integers** per tier | `initialize-payment/index.ts` |
| Insider tier | Paystack **subscription** plan + transaction | `initialize-payment/index.ts` |
| Poll for completion | Interval calls `generate-report` with `reference`, `walletAddress`, `email`, `tier` | `PaymentModal.tsx` |
| Persist + return report | Edge Function writes `report_purchases` (and related subscription rows for Insider) | `generate-report/index.ts`, `initialize-payment/index.ts` |

`generate-report` aggregates data from **external APIs** when keys are set in Supabase secrets (e.g. Etherscan, Alchemy, Moralis, Dune, Nansen, Paystack for verification). Optional **LLM** path uses `LOVABLE_API_KEY` for narrative sections (`generate-report/index.ts`).

### 4.3 Viewing a purchased report

| Step | Mechanism | Source |
|------|-----------|--------|
| Load by URL | `useParams().reference` | `Report.tsx` |
| Query | `supabase.from("report_purchases").select("*").eq("paystack_reference", reference).eq("status", "completed").maybeSingle()` | `Report.tsx` |
| Tier | `getTierFromAmount(data.amount_usd * 100)` | `Report.tsx` |

---

## 5. Feature gating (tiers)

### 5.1 Pricing tiers (product)

Defined in `src/components/PricingSection.tsx` as `PricingTier`: `basic` | `pro` | `elite` | `insider`.

| Tier | Price (UI) | `PaymentModal` `amount` (minor units) | Notes |
|------|------------|----------------------------------------|--------|
| basic | $9.99 | 999 | One-time |
| pro | $49.99 | 4999 | One-time |
| elite | $99.99 | 9999 | One-time |
| insider | $29.99/mo | 2999 | Subscription (Paystack plan) |

Server-side pricing labels/amounts also appear in `initialize-payment/index.ts` (`tierPricing`).

### 5.2 Report page section access

| Mechanism | Location |
|-----------|----------|
| `tierAccess` maps tier → allowed section keys | `Report.tsx` |
| `hasAccess(section)` gates blocks; locked sections use blur + `Lock` | `Report.tsx` |
| Tier from purchase amount | `getTierFromAmount` in `Report.tsx` (thresholds aligned with tier amounts) |

Sections include score, overview, activities, analysis blocks, allocation, etc., depending on tier (see `tierAccess` in `Report.tsx`).

**Roles:** There are **no user roles** (admin/user) in the client. “Insider” is a **product tier**, not an RBAC role.

---

## 6. Exports and downloads

| Output | How | Source |
|--------|-----|--------|
| PDF report | `generateReport(report)` — **client-side** `jspdf` + `jspdf-autotable` | `src/lib/generatePDF.ts`, triggered from `Report.tsx` (`handleDownloadPDF`) |

The PDF is generated in the **browser** from the loaded `ReportData` object, not re-fetched from the server.

---

## 7. Subscription management (Insider)

| Action | Client | Edge Function |
|--------|--------|---------------|
| Check active | `invoke("manage-subscription", { body: { action: "check", email } })` | `manage-subscription/index.ts` reads `subscriptions` |
| Cancel | `invoke("manage-subscription", { body: { action: "cancel", email } })` | Disables Paystack subscription when codes exist; updates `subscriptions` |

UI copy references **“Insider Weekly”** (`ManageSubscription.tsx`).

---

## 8. Database (Supabase)

Tables referenced in code/migrations:

| Table | Purpose (from migrations + usage) |
|-------|-------------------------------------|
| `report_purchases` | Stores completed purchases; `report_data` JSON, `paystack_reference`, `status`, amounts (`20260324232913_*.sql`) |
| `subscriptions` | Insider subscription records; Paystack codes; status (`20260325011544_*.sql`) |

Row Level Security policies exist on both tables (see migration files). The app reads `report_purchases` with the **anon** client for the report page (permitted by policies as written).

---

## 9. Edge Functions (product mapping)

| Function | File | Product role |
|----------|------|----------------|
| `initialize-payment` | `supabase/functions/initialize-payment/index.ts` | Creates Paystack transaction (and subscription plan for Insider); inserts subscription row for Insider path |
| `generate-report` | `supabase/functions/generate-report/index.ts` | Verifies payment, aggregates on-chain/API data, optional AI narrative, upserts `report_purchases` |
| `manage-subscription` | `supabase/functions/manage-subscription/index.ts` | Check/cancel subscription by email against `subscriptions` |

---

## 10. Hooks and shared utilities

| Hook / util | File | Role |
|-------------|------|------|
| `useToast` / Sonner | `src/hooks/use-toast.ts`, `src/components/ui/sonner.tsx` | Notifications (if used by pages) |
| `useIsMobile` | `src/hooks/use-mobile.tsx` | Responsive breakpoints for UI components |
| `analyzeWallet`, `isValidEthAddress` | `src/lib/scoring.ts` | Preview scoring |
| `generateReport` (PDF) | `src/lib/generatePDF.ts` | PDF export |

There is **no** “training,” **user memory**, or **background job queue** in this repo that alters UX beyond:

- Edge Function execution on demand (payment + report generation),
- Client-side timers (`Index` scan delay, `PaymentModal` polling interval).

---

## 11. Intentional omissions

- **Landing-only marketing:** The home page is the main product surface; it includes disclaimers (“not affiliated with MetaMask”) and is not excluded here because it is where scoring and purchase start.
- **Auth screens:** None present for app access.
- **Password reset:** Not present.

---

*Generated from repository structure as of the `docs/PRODUCT_CAPABILITIES.md` addition. For environment variables, see `.env.example`; for DB schema details, see `supabase/migrations/`.*
