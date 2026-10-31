# Validation record

Verified on 31 October 2026 with Node.js 25.2.1 and the already installed Chromium 1223 build. GitHub CI runs the offline Node checks on Node 22. No real OpenAI requests or paid API usage were made.

## Offline checks

`npm run check`: **14 passing tests**.

- Exploration bounds, blocked terrain, invalid movement, title/encounter movement restrictions.
- Full eight-creature search/scan/log completion, unique entries, repeat updates, refusal and unknown classification handling, leaving encounters and independent reset state.
- All eight deterministic demo responses against the validator, with no network even if a key is present.
- Documented request subset, exact Decisions endpoint/model, user `input_json`, named independent choice/predicate/score questions, unique choices, ordered score levels.
- Server-only authorization, injected live HTTP mocks, no retries, fractional score arithmetic, individual refusal, malformed/missing/mismatched answers, invalid probability distributions and scores.
- Origin and raw HTTP Host rejection, input/body limits, fixed static allowlist, CSP, key isolation, redacted upstream errors, missing key, single in-flight request, 20-per-minute cap.

Loopback HTTP tests require permission to bind temporary local servers. The normal sandbox cannot bind them; the complete suite was run with loopback permission. No tests were skipped.

## Browser checks

The dependency-free `scripts/browser-check.mjs` uses an already installed Chromium via Chrome DevTools Protocol. It creates and cleans up its own browser profile and isolated mocked live server. Run against the existing preview with `CHROME_BIN` set to the installed browser binary.

Coverage includes keyboard movement, touch-style console buttons, movement blocked by menus, all eight discoveries, field notes, request/response inspector, reset confirmation and cancellation, leaving unlogged encounters, reduced motion, narrow layouts, live billable labels, zero background API calls, individual/partial refusal, upstream failure and reset during delayed scan. It also checks for uncaught JavaScript exceptions and external page requests.

Screenshots are local supporting evidence, not repository assets: `/tmp/critterdex-title.png`, `/tmp/critterdex-encounter.png`, `/tmp/critterdex-mobile.png`.

## Limitations

Collection is session-only and clears on reload/reset. No sound, account, public deployment, or multi-user backend is included. Live Decisions access, billing, actual judgments and real refusal/rate-limit behavior remain unverified until the owner opts into paid scans and configures a server-side key.
