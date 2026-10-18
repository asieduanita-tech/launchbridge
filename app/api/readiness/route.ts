import {NextRequest,NextResponse} from 'next/server';
import {fetchLinearTasks} from '../../../lib/adapters/linear';
import {fetchAsanaTasks} from '../../../lib/adapters/asana';
import {fetchNotionTasks} from '../../../lib/adapters/notion';
import {assess} from '../../../lib/readiness';
import {briefing} from '../../../lib/briefing';
import type {Task} from '../../../lib/types';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const resolved=request.nextUrl.searchParams.get('scenario')==='resolved';
 const now=new Date();
 const results=await Promise.allSettled([fetchLinearTasks(resolved),fetchAsanaTasks(resolved),fetchNotionTasks(resolved)]);
 const errors:string[]=[];
 const sources=['Linear','Asana','Notion'];
 const tasks:Task[]=results.flatMap((r,i)=>{
  if(r.status==='rejected'){
   errors.push(`${sources[i]}: ${r.reason instanceof Error?r.reason.message:'Source unavailable'}`);
   return [];
  }
  return r.value.map(t=>({...t,lastSyncedAt:sources[i]==='Linear'&&process.env.LINEAR_MODE==='live'?t.lastSyncedAt:now.toISOString()}));
 });
 const data=assess(tasks,resolved?'Compliance resolved':'Compliance blocked',now);
 if(errors.length){
  data.health='unknown';
  for(const team of data.teams){if((team.team==='Engineering'&&errors.some(e=>e.startsWith('Linear:')))||(team.team==='Support'&&errors.some(e=>e.startsWith('Notion:')||e.startsWith('Asana:')))||(['Compliance','Operations','Marketing'].includes(team.team)&&errors.some(e=>e.startsWith('Asana:'))))team.health='unknown';}
 }
 data.briefing=briefing(data)+(errors.length?'\n\n## Source errors\n'+errors.map(e=>'- '+e).join('\n'):'');
 return NextResponse.json({...data,sourceErrors:errors,linearMode:process.env.LINEAR_MODE==='live'?'live':'mock'},{headers:{'Cache-Control':'no-store'}});
}
