# LaunchBridge

A focused, synthetic-data proof of concept for cross-functional launch readiness. Next.js App Router + TypeScript. No login, database, task duplication, or live credentials needed for the demo.

## Run locally

1. Install Node.js 20 or later.
2. Open Terminal in this folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Visit http://localhost:3000.

## Two-minute demonstration

1. Point out that Engineering is sourced from Linear, other teams from Asana, and documentation from Notion (all mocked).
2. Show the blocked scenario: Compliance regulatory sign-off is blocked, so overall launch is **Off track**.
3. Switch to the resolved scenario: Compliance sign-off is complete and approved; overall launch becomes **At risk** because Engineering's smoke test and Support training remain incomplete and high priority.
4. Click **Refresh readiness** and explain that it refetches all three adapters and recalculates readiness.
5. Click **Copy Linear update** and paste the factual Markdown briefing.

## Readiness precedence

1. Unknown when source data is missing or older than 24 hours.
2. Off track when any critical task is blocked or has rejected approval.
3. At risk when critical/high-priority tasks are unfinished or a critical approval is pending.
4. On track when all critical/high-priority tasks are finished and all required critical approvals are approved.

Team health applies the same rules to each team's tasks. Noncritical low-priority tasks do not prevent On track.

## Connecting test accounts, one adapter at a time

**Before connecting:** make test projects in Linear and Asana, and a test Notion data source. Use synthetic tasks only. Never paste API keys into the chat or commit `.env.local`.

1. Copy `.env.example` to `.env.local`. Add only the token needed for the adapter you're implementing.
2. **Linear:** create a personal API key with the least permissions available, note the test project ID, then replace `fetchLinearTasks` in `lib/adapters/linear.ts` with a server-side `POST https://api.linear.app/graphql` query. Map issue IDs, title, status, assignee, due date, URL, and labels to `Task`. Confirm the query against Linear's current schema before implementing it. Keep it read-only.
3. **Asana:** create a test personal access token and a test project. Replace `fetchAsanaTasks` with `GET` requests to the Asana REST API, requesting the required `opt_fields`. Define custom fields for team, critical, approval and priority. Preserve actual source URLs and sync timestamps.
4. **Notion:** create an internal integration, grant access to a test data source, and replace `fetchNotionTasks` with the documented data-source query endpoint for your Notion API version. Map its properties to the normalized model.
5. Introduce an adapter mode configuration for each source (`mock` vs `live`) only when integrating that source. Do not switch all sources at once.
6. Update `/api/readiness` to report per-source fetch failures and mark the overall result Unknown if a required source is unavailable; never silently treat an empty failed fetch as healthy.
7. Leave `/api/publish` disabled until you've verified the currently supported Linear project-update mutation and token scope, and added an explicit confirmation interaction. No issue/task creation is permitted.

## Scope notes

- Mock source links point to the services' homepages, **not** actual tasks. They are illustrative and labelled as such in the UI tooltip; real adapters must provide deep links.
- Mock data is regenerated on every fetch; scenario state is local to the browser and does not write to any external system.
- No real data is used. No production-grade auth, rate-limiting, retry policy, or storage is included.

## Live Linear test integration

The demo uses **synthetic test records**. The Linear test project can be queried live, while Asana and Notion remain mocked.

1. In `.env.local`, set `LINEAR_MODE=live`, `LINEAR_PROJECT_ID=29a8920b-77b0-490a-9543-187548d6b6df`, and `LINEAR_API_KEY=...` (your private token). Never commit `.env.local`.
2. Restart `npm run dev` and press **Refresh readiness**.
3. Live Linear issue links open actual source records. Mock Asana and Notion links are placeholders.
4. Switch the Compliance scenario to demonstrate Off track → At risk. The switch does not change Linear data.

The Linear adapter uses read-only GraphQL project issue queries and supports pagination. `launch-critical` marks required launch work; priority 1 or 2 marks high-priority work. A missing or failed Linear connection results in Unknown overall health, not silent fallback to mocks. Linear tasks do not automatically imply external regulatory approval. Linear API status names containing `blocked`, `stuck` or `on hold` are treated as blocked. Other custom status names may require mapping adjustments.

The publish endpoint remains disabled. Do not expose API keys to browser code or commit them to GitHub.
