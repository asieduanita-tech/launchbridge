# LaunchBridge

LaunchBridge is a cross-functional launch readiness dashboard that consolidates tasks from Linear and Asana to provide a single view of progress, blockers and risks across strategic initiatives such as market expansions and product launches.

This public version recreates a tool I've developed and used at work, using synthetic data.

**[Open the live demo](https://launchbridge-three.vercel.app)** · [Demo walkthrough](#demo)

## Dashboard Preview

### Launch Overview

![LaunchBridge overall launch readiness](Launch%20Overview.png)

### Team Readiness

![LaunchBridge team readiness](Team%20Readiness.png)

### Outstanding Work

![LaunchBridge cross-functional outstanding tasks](Tasks%20Outstanding.png)

## How It Works

Strategic initiatives often involve multiple teams working across different project management tools. This makes it difficult to get a consolidated view of progress. It also makes it difficult to identify blockers and understand whether or not a launch is on track without jumping across different tools and tabs.

LaunchBridge addresses this by:

- **Consolidating tasks:** Pulling project data from Linear (Engineering) and Asana (Operations, Compliance and other teams) into one dashboard.
- **Assessing launch readiness:** Evaluating tasks based on their status, priority, criticality and approval requirements.
- **Surfacing risks:** Highlighting blocked tasks, outstanding approvals and incomplete high-priority work.
- **Providing team-level visibility:** Showing the readiness status of individual teams alongside overall launch health.
- **Refreshing data:** Retrieving the latest information from connected platforms and recalculating readiness.

LaunchBridge uses a rules-based assessment to classify launch readiness as **On track**, **At risk**, **Off track** or **Unknown**.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **Integrations:** Linear GraphQL API, Asana REST API
- **Backend:** Next.js server-side API routes
- **Data processing:** Task normalization and rules-based readiness assessment
- **Styling:** CSS
- **Storage:** No database. Tasks come from mock fixtures or are retrieved directly from configured platforms.

## Run Locally

1. Install Node.js 20 or later.
2. Clone this repository.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`. Keep `LINEAR_MODE=mock` and `ASANA_MODE=mock` to explore the synthetic scenarios without API credentials.
5. Run `npm run dev`.
6. Visit http://localhost:3000.

API credentials must remain in `.env.local` and should never be committed to GitHub.

## Integrations

### Linear

LaunchBridge connects to Linear through its GraphQL API to retrieve Engineering tasks from a specified project. The integration is read-only and supports pagination.

### Asana

LaunchBridge connects to Asana through its REST API to retrieve tasks from a specified project, providing visibility into work managed outside Engineering.

To connect a dedicated test project, set the corresponding mode to `live` and supply its API credential and project ID in `.env.local`. Linear uses `LINEAR_API_KEY` and `LINEAR_PROJECT_ID`; Asana uses `ASANA_ACCESS_TOKEN` and `ASANA_PROJECT_ID`. Live mode reads the configured test project; it does not mean the public demo contains production company data.

Notion contributes mock documentation tasks in v1. Its live adapter is not yet implemented.

## Readiness Logic

LaunchBridge applies these rules in order. The first matching rule determines readiness:

| Status | Rule |
| --- | --- |
| **Unknown** | A source request fails, no tasks are available, or a task has a missing or invalid sync timestamp, is more than 24 hours old, or is timestamped more than one minute in the future. |
| **Off track** | A critical task is blocked or has a rejected approval. |
| **At risk** | A critical or high-priority task is incomplete, or a required critical approval is not yet approved. |
| **On track** | All critical and high-priority tasks are complete, and required critical approvals are approved. |

The same task-level rules are applied to each team. Source failures also mark affected teams as **Unknown**, making it possible to identify which workstreams are affecting overall readiness.

## Demo

### Two-minute dashboard walkthrough

1. Open the **[live demo](https://launchbridge-three.vercel.app)** to review the synthetic US market launch.
2. Check **Overall launch health** and **Critical blockers**, then review **Team readiness** to see progress across Engineering, Compliance, Operations, Marketing and Support.
3. Inspect **Launch-critical blockers** and **Outstanding work** for task owners, source tools and priority. Source links may require access to the dedicated test projects; mock links are placeholders.
4. Read the **Launch briefing** and use **Copy Linear update** to copy the summary to your clipboard. This does not publish anything to Linear.
5. Select **Refresh readiness** to retrieve current data from the configured sources and recalculate the assessment.

The dashboard requests the **resolved** scenario by default and has no scenario toggle. Its actual status depends on the configured source data.

### Compare the simulated scenarios

For a reproducible local comparison, run the app with both integrations in `mock` mode, then open these JSON endpoints:

| Scenario | Local endpoint | Expected result with mock data |
| --- | --- | --- |
| Blocked | [`/api/readiness?scenario=blocked`](http://localhost:3000/api/readiness?scenario=blocked) | **Off track**: Compliance regulatory sign-off is blocked. |
| Resolved | [`/api/readiness?scenario=resolved`](http://localhost:3000/api/readiness?scenario=resolved) | **At risk**: Compliance sign-off is complete and approved, but the production smoke test and Support training remain incomplete. |

Compare the `health`, `blockers`, `outstanding` and `briefing` fields in each response. These endpoints return JSON; opening them does not switch the dashboard scenario.

Scenario changes affect mock records only and do not modify tasks in Linear or Asana. When an integration is in live mode, it reads that project's actual test-task statuses, so the simulated results above are not guaranteed.

## Current Limitations and Security

LaunchBridge v1 is a demonstration of the underlying approach rather than a production deployment.

- Uses synthetic test data. This public version recreates a workplace tool without exposing company launch records.
- Does not include user authentication or a database. Do not connect sensitive production projects to this public demonstration.
- Does not create, update or duplicate tasks in connected platforms.
- Publishing updates back to Linear is disabled; copying a briefing only writes to the clipboard.
- API credentials remain server-side in `.env.local` or deployment environment variables and must never be committed to GitHub.
- Does not yet include production-grade rate limiting, retry handling or persistent historical reporting.

The focus of v1 is demonstrating how fragmented project data can be consolidated into actionable launch intelligence.
