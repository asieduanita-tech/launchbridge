import {NextResponse} from 'next/server';
export async function POST(){return NextResponse.json({error:'Publishing is disabled in the proof of concept until the Linear mutation, project target, and permissions are verified.'},{status:501});}
