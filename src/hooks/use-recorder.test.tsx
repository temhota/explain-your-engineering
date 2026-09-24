import { renderHook, act, waitFor } from '@testing-library/react';
import { it, expect, vi, afterEach } from 'vitest';
import { useRecorder } from './use-recorder';
afterEach(()=>vi.restoreAllMocks());
it('exposes microphone denial without losing the ability to type',async()=>{
 Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:vi.fn().mockRejectedValue(new DOMException('Denied','NotAllowedError'))}});
 const {result}=renderHook(()=>useRecorder());
 await act(async()=>{await result.current.start();});
 expect(result.current.status).toBe('idle');
 expect(result.current.error).toMatch(/microphone/i);
});
it('releases a microphone granted after the component unmounts',async()=>{
 let grant!: (stream: MediaStream)=>void; const stop=vi.fn();
 Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>new Promise<MediaStream>(resolve=>{grant=resolve;})}});
 const {result,unmount}=renderHook(()=>useRecorder());
 act(()=>{void result.current.start();});unmount();
 grant({getTracks:()=>[{stop}]} as unknown as MediaStream);
 await waitFor(()=>expect(stop).toHaveBeenCalledOnce());
});
