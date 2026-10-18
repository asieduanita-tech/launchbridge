import {mockTasks} from '../mock-data';
import type {Task} from '../types';
export async function fetchNotionTasks(resolved:boolean):Promise<Task[]> {return mockTasks(resolved).filter(t=>t.source==='Notion');}
// Future live adapter: Notion API data source query with NOTION_API_KEY server-side.
// Use a shared test data source; never modify pages.
