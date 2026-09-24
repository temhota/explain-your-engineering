import { handleInterview } from '@/server/interview';
export const runtime='nodejs';
export async function POST(request:Request){return handleInterview(request,'follow-up');}
