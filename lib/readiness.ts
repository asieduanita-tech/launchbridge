import type {Task,Health,Assessment,Team} from './types';
const MAX_AGE_MS=24*60*60*1000;
export function healthFor(tasks:Task[],now:Date):Health {
 if(!tasks.length || tasks.some(t=>!t.lastSyncedAt || !Number.isFinite(Date.parse(t.lastSyncedAt)) || now.getTime()-Date.parse(t.lastSyncedAt)>MAX_AGE_MS || Date.parse(t.lastSyncedAt)>now.getTime()+60000))return 'unknown';
 if(tasks.some(t=>t.critical&&(t.status==='blocked'||t.approval==='rejected')))return 'off_track';
 if(tasks.some(t=>(t.critical||t.highPriority)&&(t.status!=='complete'||(t.critical&&t.approval!=='approved'&&t.approval!=='not_required'))))return 'at_risk';
 return 'on_track';
}
export function assess(tasks:Task[],scenario:string,now=new Date()):Assessment {
 const teams:Team[]=['Engineering','Compliance','Operations','Marketing','Support'];
 const blockers=tasks.filter(t=>t.critical&&(t.status==='blocked'||t.approval==='rejected'));
 const outstanding=tasks.filter(t=>!blockers.includes(t)&&(t.critical||t.highPriority)&&(t.status!=='complete'||(t.critical&&t.approval!=='approved'&&t.approval!=='not_required')));
 const health=healthFor(tasks,now);
 const teamRows=teams.map(team=>{const rows=tasks.filter(t=>t.team===team);return {team,health:healthFor(rows,now),done:rows.filter(t=>t.status==='complete'&&(t.approval==='approved'||t.approval==='not_required')).length,total:rows.length};});
 return {health,teams:teamRows,blockers,outstanding,tasks,scenario,assessedAt:now.toISOString(),briefing:''};
}
