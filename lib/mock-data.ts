import type {Task,Team,Source,TaskStatus,Approval} from './types';
const stamp = '2026-10-16T12:00:00.000Z';
const due = '2026-11-02';
function t(id:string,task:string,team:Team,source:Source,status:TaskStatus,owner:string,critical:boolean,approval:Approval='not_required',highPriority=false):Task {return {id,task,team,source,status,owner,dueDate:due,critical,highPriority,approval,url:source==='Linear'?'https://linear.app/':source==='Asana'?'https://app.asana.com/':'https://www.notion.so/',lastSyncedAt:stamp};}
export function mockTasks(resolved=false):Task[]{return [
 t('ENG-101','US payment rails integration','Engineering','Linear','complete','Alex Chen',true,'approved'),
 t('ENG-102','US card transaction monitoring','Engineering','Linear','complete','Priya Shah',true,'approved'),
 t('ENG-103','Final production smoke test','Engineering','Linear','in_progress','Jordan Lee',false,'not_required',true),
 t('CMP-201','Regulatory launch sign-off','Compliance','Asana',resolved?'complete':'blocked','Morgan Ellis',true,resolved?'approved':'pending'),
 t('CMP-202','US disclosures review','Compliance','Asana','complete','Morgan Ellis',true,'approved'),
 t('OPS-301','Settlement and reconciliation runbook','Operations','Asana','complete','Sam Rivera',true,'approved'),
 t('MKT-401','US launch communications approval','Marketing','Asana','complete','Taylor Brooks',true,'approved'),
 t('SUP-501','Support agent training','Support','Asana','in_progress','Casey Moore',false,'not_required',true),
 t('DOC-601','Launch FAQ documentation','Support','Notion','complete','Casey Moore',false)
 ];}
