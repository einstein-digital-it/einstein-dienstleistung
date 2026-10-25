# EinStein Dienstleistung — notes for Claude

Working branch: `release/android` (not main). The team talks in Levantine Arabic, so reply short and step by step.

## Structure
- `backend/` — Laravel 12, PHP 8.3, sqlite. API under `/api`. Custom middleware `api.auth:roles`.
- `front_end/` — React + Vite. `VITE_BACKEND_API_URL` points at the API.
- `mobile/user_einstein/` — Flutter customer app (GetX). Package `de.einsteindienstleistung.einstein`.
  - API URL comes from `--dart-define=EINSTEIN_API_BASE_URL=...`.
- `deploy/server-setup.sh <domain> <admin-email>` — fresh Ubuntu 24.04 server (nginx, php8.3, certbot, MCP secret).
- `deploy/update.sh` — pull + migrate + rebuild.
- `.github/workflows/android-release.yml` — builds the signed AAB + APK on push to `mobile/user_einstein/**`.
  - Secrets: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`. Variable: `API_BASE_URL`.

## Features already built
- Services: `eur1` (EUR.1, from 150 € net) and `dokumentabo` (Dokumenten-Abo, 49 €/month net).
- VAT: 19 % is added on top of the net price (`config('services.tax.vat_rate')`, env `VAT_RATE`). AGB §5 and the Impressum say so.
- Stripe Checkout (raw REST, no SDK):
  - Code: `app/Services/StripeClient.php`, `Api/StripeController.php`.
  - Endpoints: `POST /api/payments/bookings/{id}/checkout` (auth) and `POST /api/stripe/webhook`.
  - `dokumentabo` is billed as a monthly subscription.
  - Env: `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`.
- §312k cancellation button:
  - Page: `front_end/src/pages/Cancellation.jsx`.
  - Endpoint: `POST /api/public/cancellations`, which also cancels a matching Stripe Abo at the end of the period.
- Legal pages: AGB, Datenschutz, Impressum (`front_end/src/content/legal.js`, `src/pages/*.jsx`).
- MCP endpoint at `/api/mcp/{MCP_SECRET}` (`Api/McpController.php`) — manages bookings, services, prices, offers, etc.
- Customers cannot set `payment_status`, `price` or invoice fields themselves (`BookingController::withoutStaffOnlyFields`).

## Status / open
- Hosting: a Strato VPS is bought but not active yet. When it is active:
  1. Point the DNS A record `app.einsteindienstleistung.com` at the new IP. Do NOT touch the main domain's A record (it hosts WordPress).
  2. Run `server-setup.sh`.
  3. Set up the Stripe webhook (test mode first).
- The backend has only been PHP-linted, never run against a real DB. First step: `composer install && php artisan migrate && php artisan test`.
- Mobile app has not been run on a device by Claude yet. Check with `flutter analyze`, `flutter test`, then a run on an emulator.
- Open questions:
  - USt-IdNr for the Impressum.
  - Website (front_end) still shows net prices; the app shows gross incl. 19 % MwSt. (PAngV).

## Rules
- Never put passwords, API keys, the keystore or the MCP URL in code, commits or chat. The owner enters secrets herself.
- Do not commit `android/key.properties` or `*.jks`.
