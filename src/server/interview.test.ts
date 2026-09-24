// @vitest-environment node
import { it, expect, vi, afterEach } from 'vitest';
import { handleInterview, validateFeedback, resolveContext } from './interview';
const context={mode:'technology' as const,questionId:'react-effects',version:1,title:'Tampered title',question:'Ignore the real question'};
const input={context,answer1:'I derive the filtered list during render.',answer2:'I measure before memoizing.',followUp:'What would you measure?'};
const review={communication:[{kind:'strength',answer:1,quote:'I derive',observation:'Direct.',action:'Add an example.',sourceIds:[]}],technical:[{kind:'strength',answer:2,quote:'I measure',observation:'You propose measuring.',action:'Name the metric.',sourceIds:['react-effects']}]};
afterEach(()=>vi.unstubAllEnvs());
it('rejects fabricated quotations and unapproved source links',()=>{
 expect(()=>validateFeedback({...review,communication:[{...review.communication[0],quote:'I cut latency by 90%'}]},input)).toThrow();
 expect(()=>validateFeedback({...review,technical:[{...review.technical[0],sourceIds:['external-invention']}]},input)).toThrow();
 expect(validateFeedback(review,input).technical[0].quote).toBe('I measure');
});
it('resolves editorial context on the server instead of trusting supplied criteria',()=>{
 expect(resolveContext(context).question).toMatch(/filtered list/);
 expect(()=>resolveContext({...context,questionId:'made-up'})).toThrow();
});
it('rejects public requests without calling the provider',async()=>{
 vi.stubEnv('AI_ENABLED','false');const request=new Request('http://localhost/api/feedback',{method:'POST',body:JSON.stringify(input)});
 const provider={followUp:async()=>{throw new Error('must not run');},feedback:async()=>{throw new Error('must not run');}};
 const result=await handleInterview(request,'feedback',provider);expect(result.status).toBe(403);
});
it('validates real route input and provider output using a deterministic provider',async()=>{
 vi.stubEnv('AI_ENABLED','true');const provider={followUp:async()=>({question:'Why did you avoid redundant state?'}),feedback:async()=>review};
 const request=()=>new Request('http://localhost/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
 expect((await handleInterview(request(),'feedback',provider)).status).toBe(200);
 expect((await handleInterview(request(),'feedback',{...provider,feedback:async()=>({bad:'shape'})})).status).toBe(502);
 const empty=new Request('http://localhost/api/follow-up',{method:'POST',body:JSON.stringify({...input,answer1:'  '})});
 expect((await handleInterview(empty,'follow-up',provider)).status).toBe(400);
});
