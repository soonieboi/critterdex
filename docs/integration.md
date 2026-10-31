# How CritterDex uses the Decisions API

## Flow and evidence

Browser → local `POST /api/decision` → Node request builder → `POST https://api.openai.com/v1/decisions` → validated typed answers → discovery reveal → player logs a field-guide entry.

The browser submits exactly one integer: `{encounter: 0}` through `{encounter: 7}`. It cannot select a URL, model, key, freeform prompt, or arbitrary observations. The server supplies the encounter’s authored fictional clues. This makes the endpoint a bounded game operation rather than a general API proxy.

`buildRequest` uses `model`, `input`, and `questions`. The fixed model is `gpt-6-luna`. `input` contains a user message with `{type: "input_json", data: {observations: {...}}}`. Observations are habitat, body, light, and behavior. The input does not contain the intended species ID. Choice descriptions supply the eight possible field-guide definitions.

The three questions are independent evaluations of the same evidence. They are not chained and do not assume another answer.

## World navigation and encounter selection

The expanded 72 × 48 world has four distinct biomes and twelve named encounter landmarks. Camera scrolling, the minimap, full-map navigation, collisions, and trail traversal are entirely local and trigger no API calls. Each landmark features a creature from its own region; off-landmark searches favor unlogged local species. The station is an encounter-free hub. The eight species definitions and their request schema are unchanged.

World position and collection stay intact when menus open, regions change, an encounter is left, or the viewport resizes. Completing the guide does not lock exploration. Collections remain session-only and reset only on reload or an explicitly confirmed adventure reset.

## Answers and gameplay mappings

| Name | API type | Mapping |
| --- | --- | --- |
| `species` | choice | Returned ID chooses the species name, authored field note, and collection key |
| `luminous` | predicate | Estimated probability ≥0.5 displays LUMINOUS; lower displays NO GLOW |
| `curiosity` | score | Ordered Shy (0), Watchful (1), Bold (2) levels produce a displayed 0–2 score |

The predicate concerns light emitted by the creature; reflected sunlight is excluded. Curiosity concerns approaching, staying distant, or retreating from the scanner. Score values can fall between integer levels because the API computes a probability-weighted mean of the indices.

Choice and score answers include per-option probabilities and a separate confidence field. The inspector preserves those validated values. They are not guarantees or measured accuracy. The predicate threshold is a toy-game convention, not a calibrated real-world rule.

The game records the classification returned by Decisions. A live classification can differ from the authored intended species; the app does not secretly replace it. The physical creature sprite is authored encounter art, while the classified name/note comes from the chosen field-guide entry. The log action requires player input. No creature is automatically collected by an API response.

All sprites, names, descriptions, field notes and outcomes are authored game content. Decisions does not generate that prose and no model-generated explanation is claimed.

## Response validation and failures

The official response has `model`, `answers`, and `usage`. This app checks the fixed model and each named answer in request order. It validates finite probability bounds, complete and unique probability entries, approximate sums, option membership, score labels, and weighted-score consistency. It deliberately returns only `model` and validated `answers` to the browser. Usage and unknown fields are omitted; the inspector labels this a **response subset**, not a full wire dump.

Each question can return `{type: "refusal", name: ...}`. A refused trait shows REFUSED while other valid answers remain usable. A refused species cannot be logged as an invented discovery. The player can rescan explicitly or leave the encounter.

Malformed responses, missing keys, transport failures and upstream HTTP errors show explicit errors without adding a collection entry. Live failures do not become demo scans. A server timeout bounds the upstream request at 12 seconds. There are no automatic retries, since they could add charges.

Reset and leaving an encounter invalidate outstanding browser work. Reset during a delayed scan cannot populate the new collection. Historical collection scans have a separate inspector selection and cannot replace the current encounter’s classification. Aborting a browser request does not guarantee that an already-sent OpenAI request stops or avoids billing.

## Demo semantics

Demo uses the same request builder and response validator as live mode, but no network. Authored creature data supplies the ID, boolean glow trait and integer curiosity level. Choice and score distributions are one-hot; confidence is 1 as a synthetic rule output. Predicate probability is 0 or 1. These are visibly labelled synthetic, not model output, model confidence, or predictions of live behavior.

Demo is the server default, regardless of whether an API key happens to be present. Only explicit live configuration permits the adapter to contact OpenAI. The UI waits for server configuration before enabling a scan.

## Key and server boundaries

`OPENAI_API_KEY` is read only by the Node server. The key is attached to the upstream Authorization header, never returned to the browser, shown in UI, or logged. Environment files are ignored. No browser key form or credential retrieval exists.

The server binds to `127.0.0.1`; numeric loopback Host headers are required. Adviser POSTs require the exact local Origin and JSON content type. A fixed allowlist exposes only public assets, not source server files or environment files. CSP allows browser requests only to self. Bodies are bounded to 2 KiB, inputs are checked, only one scan is in flight, and a process-wide cap permits 20 scans per minute. No external art, fonts, analytics or runtime dependencies are fetched.

Do not expose the local development server to the network. Public use would need authentication, per-user billing controls and a deployment review.

## Live requirements still outstanding

The owner must explicitly opt into charges and configure a restricted project key with Decisions access on the server. Then verify one real scan against the official schema, account permissions, billing, actual model judgments, refusal behavior and rate limits. This build’s live transport tests inject mock responses; no real key, credential creation, paid call, or deployment was performed.

## Official references

- [Decisions guide](https://developers.openai.com/api/docs/guides/decisions)
- [Create a decision schema](https://developers.openai.com/api/reference/resources/decisions/methods/create)

Checked 31 October 2026. This app intentionally implements only the API subset used by the game.
