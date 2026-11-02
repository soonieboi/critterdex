# CritterDex ✦

An original retro handheld game and an inspectable integration of **OpenAI’s actual Decisions API**. Explore a scrolling 72 × 48 pixel world, follow trails through four biomes and twelve encounter landmarks, scan eight unusual creatures, and build a collectible field guide.

This standalone project is separate from Fieldwork. It runs without a build step, runtime dependencies, database, external art, external fonts, or a paid service. All critters, names, sprites, map art, and field notes are original.

## Play locally

Requires Node.js 22 or later.

```sh
npm start
```

Open **http://127.0.0.1:4317**. The server binds only to loopback. If that port is occupied, use `PORT=4318 npm start`. Existing processes are never stopped automatically. Use the printed numeric loopback URL; the Host guard deliberately rejects `localhost`.

- Move with **WASD / arrow keys** or the touch direction pad.
- Use the console’s **A button** or **Z / Space / Enter** to search, scan, then log a discovery.
- Use **B / X / Escape** to leave an encounter or close a menu.
- **M** opens the full world map; **F** opens the field guide; **H** opens Help.
- Menus pause exploration. Motion can be switched off and respects the system’s reduced-motion preference. This build has no audio.

Start at the central field station. Fernwood lies northwest, Moonlit Grove northeast, Dewdrop Marsh southwest, and Pebble Ridge southeast. Pale trails and wooden bridges connect every area. The camera follows the player and stops at world edges; the minimap shows your position and current camera frame. Open WORLD MAP for a larger overview and landmark guide.

Sparkling named landmarks feature specific local creatures. Searching elsewhere favors unlogged creatures from your current region; species do not appear in unrelated regions. The station is a safe hub without encounters. Scan results determine the species added to your guide. A repeated species updates its entry without duplicating it. Collect all eight to complete the guide, then keep exploring and rescanning without losing your collection. There is no timer, combat, or loss condition. Your collection is **session only**: reloading or confirming Reset Adventure clears it.

## Demo versus actual API

**Demo is the default.** It uses deterministic local rules and labels results as synthetic. It never calls OpenAI, even if an API key is already in the environment. One-hot demo probabilities illustrate the schema; they are not model confidence or a prediction of live output.

In live mode the server sends one request to `https://api.openai.com/v1/decisions` with `model: "gpt-6-luna"`. A user-message `input_json` content part carries the observed habitat, body, light, and behavior. Three independent questions share that evidence:

| Question | Type | Game use |
| --- | --- | --- |
| `species` | `choice` | Select one of eight supplied species IDs; controls the discovery name, authored note, and collection entry |
| `luminous` | `predicate` | A game-specific 0.5 probability threshold displays LUMINOUS / NO GLOW |
| `curiosity` | `score` | Show approach behavior on Shy / Watchful / Bold levels (0–2), including fractional scores |

The API returns typed answers, not a written rationale. Creature notes and art are authored game content. A classification can differ from the encounter’s intended species in live mode; the collection follows the returned choice.

Open **Help → API Lab** in the game to see the integration guide and the exact built request plus a validated response subset. Collection entries also link to their stored scan. The source label always distinguishes demo from live results. See [docs/integration.md](docs/integration.md) for the implementation and failure boundaries.

## Enable live mode securely

The live adapter is implemented and tested with mocked HTTP responses. **Real account access, model judgments, and live responses remain unverified. No paid API calls were made.** Enable live mode only when you choose to incur charges.

1. Copy `.env.example` to `.env` locally. `.env` files are ignored by Git.
2. Set `DECISIONS_MODE=live` and add your own `OPENAI_API_KEY` to the local file in a trusted editor. Do not paste a key into chat, browser code, command-line arguments, committed files, screenshots, or logs. Use a restricted project key with a suitable budget.
3. Stop only this project’s server and restart it with:

   ```sh
   node --env-file=.env server.mjs
   ```

4. Confirm the console says **LIVE · BILLABLE SCANS**. Exploration, searching, Help, collection, logging, and reset do not call OpenAI. Only the button labelled **SCAN · PAID** sends one billable request with all three questions. There are no background model calls and no automatic retries.

The key stays server-side. Refused questions remain individually visible. A refused species cannot be logged; other valid traits still display. Timeout, invalid responses, unavailable key, authentication errors, and rate limits show explicit errors and do not add discoveries. Live failures never fall back to fake results. Return to demo by restarting without live configuration or setting `DECISIONS_MODE=demo`.

## Verify

```sh
npm run check
```

The 17 offline tests cover reachability of every walkable tile and all twelve sites, exhaustive collisions, camera edges and viewport sizes, minimap coordinates, regional encounters, all eight discoveries, continued exploration after completion, duplicate handling, reset state, deterministic demo behavior, official request/response schema subset, fractional scores, refusals, malformed responses, upstream failure, key isolation, origin/Host guards, body limits, static file restrictions, and request concurrency/rate bounds.

An optional browser check uses an **already installed Chromium** without downloading software:

```sh
CHROME_BIN=/path/to/chromium node scripts/browser-check.mjs
```

Run the preview first. The browser check travels through every region, collects all eight species, verifies four camera edges and minimap alignment, tests actual touch input and 320px/390px layouts, and checks map/menu navigation, collection preservation, inspector, reset confirmation, reduced motion, and mocked live errors/refusals. It does not use a real key or OpenAI. See [docs/validation.md](docs/validation.md).

## Project map

- `public/game.js` — original creature data, 72 × 48 world geometry, encounter sites, camera/minimap coordinates and collection state
- `public/pixel.js` — scrolling biome renderer, cached minimap, full map, encounters, sprites and thumbnails
- `public/app.js` — controls, scanner flow, menus, Help and API inspector
- `lib/decisions.mjs` — official request builder, deterministic demo, strict response validation, live transport
- `server.mjs` — fixed static allowlist, loopback/Origin guards, bounded requests, isolated server key
- `test/` — offline gameplay, schema, transport and HTTP tests
- `.github/workflows/check.yml` — Node 22 offline checks

This is a local educational project. No deployment has been created. Public hosting would require authentication, per-user spending limits, and deployment configuration.

## Credits & contact

Created by [@soonieboi](https://github.com/soonieboi), with development assistance from Codex. Creature designs, pixel art and field notes are original to CritterDex. Optional live scans use the OpenAI Decisions API.

For feedback or bug reports, use [this repository’s Issues page](https://github.com/soonieboi/critterdex/issues), or visit the [creator’s GitHub profile](https://github.com/soonieboi). Please keep API keys and other secrets out of issues.

## Official references

Schema verified on **31 October 2026** against the [Decisions guide](https://developers.openai.com/api/docs/guides/decisions) and [Create a decision reference](https://developers.openai.com/api/reference/resources/decisions/methods/create). API behavior and model availability may change.

MIT licensed. Independent learning project; not affiliated with OpenAI or any existing creature-collection franchise.
