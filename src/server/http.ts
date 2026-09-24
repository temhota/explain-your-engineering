import 'server-only';
import OpenAI from 'openai';
export function errorResponse(status: number, code: string, message: string) { return Response.json({error:{code,message}},{status}); }
export function liveGate(request: Request) {
  if (process.env.AI_ENABLED !== 'true') return errorResponse(403,'AI_DISABLED','Live AI is disabled in this deployment. Run the app locally with your own server API key.');
  const origin=request.headers.get('origin');
  if(origin && origin!==new URL(request.url).origin)return errorResponse(403,'ORIGIN_REJECTED','This request must come from the application.');
  return null;
}
export function aiClient() { if(!process.env.OPENAI_API_KEY)throw new Error('API key missing');return new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:60000,maxRetries:0}); }
export function providerError() { return errorResponse(502,'PROVIDER_ERROR','The AI service could not complete this request. Your answer is safe. Check your server configuration and try again.'); }
