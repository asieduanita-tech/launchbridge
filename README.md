# LaunchBridge

LaunchBridge is a cross-functional launch readiness dashboard that consolidates tasks from Linear and Asana to provide a single view of progress, blockers and risks across strategic initiatives such as market expansions and product launches.

This public version recreates a tool I've developed and used at work, using synthetic data.


## Dashboard Preview

### Launch Overview
![LaunchBridge overall launch readiness](screenshots/launch-overview.png)

### Team Readiness
![LaunchBridge team readiness](screenshots/team-readiness.png)

### Outstanding Work
![LaunchBridge cross-functional outstanding tasks](screenshots/outstanding-work.png)


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
- **Storage:** No database. Tasks are retrieved directly from connected platforms.

## Run Locally

1. Install Node.js 20 or later.
2. Clone this repository.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local` and configure the relevant integrations.
5. Run `npm run dev`.
6. Visit http://localhost:3000.

API credentials must remain in `.env.local` and should never be committed to GitHub.

## Integrations

**Linear**

LaunchBridge connects to Linear through its GraphQL API to retrieve Engineering tasks from a specified project. The integration is read-only and supports pagination.

**Asana**

LaunchBridge connects to Asana through its REST API to retrieve tasks from a specified project, providing visibility into work managed outside Engineering.

## Readiness Logic

LaunchBridge applies the following rules to determine overall launch readiness:

1. **Unknown:** Required source data is missing, unavailable or more than 24 hours old.
2.Off track: A critical task is blocked or has a rejected approval.

At risk: Critical or high-priority tasks remain incomplete, or a critical approval is pending.

On track: All critical and high-priority tasks are complete and required critical approvals are approved.

The same logic is applied at team level, making it possible to identify which teams or workstreams are affecting overall readiness.

Demo

The dashboard supports a simulated scenario demonstrating how launch readiness changes when a critical blocker is resolved.

Blocked scenario: Compliance regulatory sign-off is blocked, resulting in an overall status of Off track.

Resolved scenario: The Compliance blocker is resolved, but outstanding high-priority work keeps the overall status at At risk.

Refresh readiness: Retrieves current task data from the configured sources and recalculates readiness.

Scenario changes are for demonstration purposes and do not modify tasks in Linear or Asana.

Current Limitations

LaunchBridge v1 is a demonstration of the underlying approach rather than a production deployment.

Uses synthetic test data.


Does not include user authentication or a database.

Does not create, update or duplicate tasks in connected platforms.

Publishing updates back to Linear is disabled.

Does not yet include production-grade rate limiting, retry handling or persistent historical reporting.

The focus of v1 is demonstrating how fragmented project data can be consolidated into actionable launch intelligence.
