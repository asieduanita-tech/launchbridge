export type Source = 'Linear' | 'Asana' | 'Notion';
export type Team = 'Engineering' | 'Compliance' | 'Operations' | 'Marketing' | 'Support';
export type TaskStatus = 'complete' | 'in_progress' | 'blocked' | 'not_started';
export type Approval = 'approved' | 'pending' | 'rejected' | 'not_required';
export type Health = 'on_track' | 'at_risk' | 'off_track' | 'unknown';
export type Task = {id:string; task:string; team:Team; source:Source; status:TaskStatus; owner:string; dueDate:string; critical:boolean; highPriority:boolean; approval:Approval; url:string; lastSyncedAt:string};
export type Assessment = {health:Health; teams:{team:Team;health:Health;done:number;total:number}[]; blockers:Task[]; outstanding:Task[]; tasks:Task[]; briefing:string; assessedAt:string; scenario:string};
