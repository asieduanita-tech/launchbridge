
import type { Task, Team, TaskStatus } from '../types';
import { mockTasks } from '../mock-data';

type AsanaTask = {
  gid: string;
  name: string;
  completed: boolean;
  assignee?: { name: string } | null;
  due_on?: string | null;
  permalink_url?: string;
  memberships?: {
    project?: { gid: string };
    section?: { name: string };
  }[];
  custom_fields?: {
    name: string;
    display_value?: string | null;
  }[];
};

const validTeams: Team[] = [
  'Engineering',
  'Compliance',
  'Operations',
  'Marketing',
  'Support',
];

export async function fetchAsanaTasks(
  resolved: boolean
): Promise<Task[]> {
  if (process.env.ASANA_MODE !== 'live') {
    return mockTasks(resolved).filter(t => t.source === 'Asana');
  }

  const token = process.env.ASANA_ACCESS_TOKEN;
  const projectId = process.env.ASANA_PROJECT_ID;

  if (!token || !projectId) {
    throw new Error('Missing Asana API token or project ID');
  }

  const tasks: Task[] = [];
  let url: string | null =
    `https://app.asana.com/api/1.0/projects/${projectId}/tasks` +
    '?limit=100&opt_fields=' +
    encodeURIComponent(
      'gid,name,completed,assignee.name,due_on,permalink_url,' +
      'memberships.project.gid,memberships.section.name,' +
      'custom_fields.name,custom_fields.display_value'
    );

  while (url) {
    const response: Response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Asana API returned HTTP ${response.status}`);
    }

    const result: {
      data: AsanaTask[];
      next_page?: { uri: string } | null;
    } = await response.json();

    for (const item of result.data) {
      const sectionName = item.memberships?.find(
        membership => membership.project?.gid === projectId
      )?.section?.name;

      if (!sectionName || !validTeams.includes(sectionName as Team)) {
        continue;
      }

      const team = sectionName as Team;

      const priority = item.custom_fields?.find(
        field => field.name.toLowerCase() === 'priority'
      )?.display_value?.toLowerCase();

      const status: TaskStatus = item.completed
        ? 'complete'
        : 'not_started';

      tasks.push({
        id: item.gid,
        task: item.name.trim(),
        team,
        source: 'Asana',
        status,
        owner: item.assignee?.name ? 'Alex Morgan' : 'Unassigned',
        dueDate: item.due_on || '',
        critical: false,
        highPriority: priority === 'high',
        approval: 'not_required',
        url: item.permalink_url ||
          `https://app.asana.com/0/${projectId}/${item.gid}`,
        lastSyncedAt: new Date().toISOString(),
      });
    }

    url = result.next_page?.uri || null;
  }

  return tasks;


}
