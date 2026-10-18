
import { mockTasks } from '../mock-data';
import type { Task, TaskStatus } from '../types';

type LinearIssue = {
  identifier: string;
  title: string;
  priority: number;
  url: string;
  dueDate: string | null;
  state: { name: string; type: string } | null;
  assignee: { name: string } | null;
  team: { name: string } | null;
  labels: { nodes: { name: string }[] };
};

type LinearResponse = {
  data?: {
    project?: {
      issues?: {
        nodes: LinearIssue[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    };
  };
  errors?: { message: string }[];
};

const query = `
  query LaunchBridgeIssues($id: String!, $after: String) {
    project(id: $id) {
      issues(first: 100, after: $after) {
        nodes {
          identifier
          title
          priority
          url
          dueDate
          state { name type }
          assignee { name }
          team { name }
          labels { nodes { name } }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

function mapStatus(issue: LinearIssue): TaskStatus {
  const name = issue.state?.name.toLowerCase() || '';

  if (/block|stuck|on hold/.test(name)) return 'blocked';
  if (issue.state?.type === 'completed') return 'complete';
  if (issue.state?.type === 'started') return 'in_progress';

  return 'not_started';
}

export async function fetchLinearTasks(
  _resolved: boolean
): Promise<Task[]> {
  if (process.env.LINEAR_MODE !== 'live') {
    return mockTasks(false).filter(t => t.source === 'Linear');
  }

  const token = process.env.LINEAR_API_KEY;
  const id = process.env.LINEAR_PROJECT_ID;

  if (!token || !id) {
    throw new Error(
      'Linear live mode requires LINEAR_API_KEY and LINEAR_PROJECT_ID'
    );
  }

  const issues: LinearIssue[] = [];
  let after: string | null = null;
  const syncedAt = new Date().toISOString();

  do {
    const response: Response = await fetch(
      'https://api.linear.app/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          query,
          variables: { id, after },
        }),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(
        `Linear API returned HTTP ${response.status}`
      );
    }

    const result: LinearResponse = await response.json();

    if (result.errors?.length) {
      throw new Error(
        `Linear GraphQL: ${result.errors[0].message}`
      );
    }

    const connection = result.data?.project?.issues;

    if (!connection) {
      throw new Error(
        'Linear project was not found or is inaccessible'
      );
    }

    issues.push(...connection.nodes);

    after = connection.pageInfo.hasNextPage
      ? connection.pageInfo.endCursor
      : null;

    if (issues.length > 1000) {
      throw new Error('Linear issue limit exceeded for demo');
    }
  } while (after);

  if (!issues.length) {
    throw new Error(
      'Linear project has no issues; readiness cannot be assessed'
    );
  }

  return issues.map(issue => {
    const labels = issue.labels.nodes.map(
      x => x.name.toLowerCase()
    );

    return {
      id: issue.identifier,
      task: issue.title,
      team: 'Engineering',
      source: 'Linear',
      status: mapStatus(issue),
      owner: issue.assignee?.name
        ? 'Alex Morgan'
        : 'Unassigned',
      dueDate: issue.dueDate || '',
      critical: labels.includes('launch-critical'),
      highPriority:
        issue.priority === 1 || issue.priority === 2,
      approval: 'not_required',
      url: issue.url,
      lastSyncedAt: syncedAt,
    } satisfies Task;
  });
}
