import 'server-only';
import { z } from 'zod';
import { contextSchema, feedbackSchema, type Context } from '@/lib/domain';
import { findQuestion } from './questions';
import { errorResponse, liveGate, providerError } from './http';
import { openAIProvider } from './provider';
const inputSchema=z.object({context:contextSchema,answer1:z.string().trim().min(1).max(12000),answer2:z.string().max(12000).default(''),followUp:z.string().max(2000).nullable().default(null)});
export type InterviewInput=z.infer<typeof inputSchema>;
export interface ResolvedContext { question:string;criteria:string[];alternatives:string[];pitfalls:string[];sourceIds:string[];experience?:unknown; }
export interface InterviewProvider { followUp:(input:InterviewInput,context:ResolvedContext,signal:AbortSignal)=>Promise<unknown>;feedback:(input:InterviewInput,context:ResolvedContext,signal:AbortSignal)=>Promise<unknown>; }
export const followUpSchema=z.object({question:z.string().trim().min(10).max(1500)});
export function resolveContext(context:Context):ResolvedContext{
 if(context.mode==='technology'){const question=findQuestion(context.questionId,context.version);if(!question)throw new Error('Unknown question version.');return question;}
 return {question:`Walk me through a technical decision you made while working on ${context.experience.title}. Explain your role, the alternatives and the trade-off.`,experience:context.experience,criteria:['Explain a concrete decision, personal contribution and trade-off.','Separate observed outcomes from assumptions; never invent outcomes.'],alternatives:[],pitfalls:['Do not verify biography or infer missing project facts.'],sourceIds:[]};
}
export function validateFeedback(value:unknown,input:InterviewInput){
 const feedback=feedbackSchema.parse(value);const context=resolveContext(input.context);
 if(!feedback.communication.length||!feedback.technical.length)throw new Error('Empty review.');
 for(const item of [...feedback.communication,...feedback.technical]){
  const answer=item.answer===1?input.answer1:input.answer2;
  if(!answer.includes(item.quote)||!item.quote.trim())throw new Error('The review quoted text that is not in the answer.');
  if(item.sourceIds.some(id=>!context.sourceIds.includes(id)))throw new Error('Unapproved reference.');
 }
 return feedback;
}
export async function handleInterview(request:Request,operation:'follow-up'|'feedback',provider:InterviewProvider=openAIProvider):Promise<Response>{
 const gate=liveGate(request);if(gate)return gate;
 let input:InterviewInput;let context:ResolvedContext;
 try{
  const reader=request.body?.getReader();if(!reader)throw new Error('Empty body');let bytes=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>64000){await reader.cancel();return errorResponse(413,'TOO_LARGE','Keep the request below 64 KB.');}chunks.push(value);}
  input=inputSchema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
  if(operation==='feedback'&&(!input.answer2.trim()||!input.followUp?.trim()))throw new Error('Both answers are required.');
  context=resolveContext(input.context);
 }catch{return errorResponse(400,'INVALID_INPUT','Check the question and add a non-empty answer before continuing.');}
 try{
  if(operation==='follow-up')return Response.json(followUpSchema.parse(await provider.followUp(input,context,request.signal)));
  return Response.json({feedback:validateFeedback(await provider.feedback(input,context,request.signal),input)});
 }catch{return providerError();}
}
