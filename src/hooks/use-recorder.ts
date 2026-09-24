'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
export function useRecorder() {
  const [status, setStatus] = useState<'idle'|'requesting'|'recording'|'recorded'>('idle');
  const [error, setError] = useState<string|null>(null);
  const [blob, setBlob] = useState<Blob|null>(null);
  const [url, setUrl] = useState<string|null>(null);
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder|null>(null);
  const audioUrl = useRef<string|null>(null);
  const stream = useRef<MediaStream|null>(null);
  const timer = useRef<ReturnType<typeof setInterval>|null>(null);
  const generation = useRef(0); const busy = useRef(false);
  const stop = useCallback(() => { if (recorder.current?.state === 'recording') recorder.current.stop(); }, []);
  const release = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    stream.current?.getTracks().forEach(track => track.stop()); stream.current = null;
  }, []);
  useEffect(() => () => { generation.current++; stop(); release(); if(audioUrl.current) URL.revokeObjectURL(audioUrl.current); }, [release, stop]);
  const start = async () => {
    if (busy.current) return;
    busy.current = true; const current = ++generation.current;
    if(audioUrl.current) URL.revokeObjectURL(audioUrl.current); audioUrl.current=null;
    setError(null); setStatus('requesting'); setBlob(null); setUrl(null); setSeconds(0);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone recording is unavailable. Use text input instead.');
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation.current !== current) { media.getTracks().forEach(track=>track.stop()); return; }
      stream.current = media;
      if (typeof MediaRecorder === 'undefined') throw new Error('Microphone recording is unavailable in this browser. Use text input instead.');
      const mimeType = ['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error('No supported microphone audio format. Use text input instead.');
      const instance = new MediaRecorder(media, { mimeType, audioBitsPerSecond: 64000 }); recorder.current = instance;
      const chunks: Blob[] = []; let size=0;
      instance.ondataavailable = event => { if (event.data.size) { chunks.push(event.data); size+=event.data.size; if(size>10*1024*1024) stop(); } };
      instance.onstop = () => {
        release(); busy.current=false;
        if (generation.current !== current) return;
        if (!chunks.length || size>10*1024*1024) { setError('The recording is empty or too large. Please record again.'); setStatus('idle'); return; }
        const recording=new Blob(chunks,{type:mimeType}); audioUrl.current=URL.createObjectURL(recording); setUrl(audioUrl.current); setBlob(recording); setStatus('recorded');
      };
      instance.onerror = () => { release(); busy.current=false; if(generation.current===current){setError('Microphone recording failed. Your text has not changed.');setStatus('idle');} };
      instance.start(1000); setStatus('recording'); const started=Date.now();
      timer.current=setInterval(()=>{ const elapsed=Math.floor((Date.now()-started)/1000);setSeconds(Math.min(elapsed,180));if(elapsed>=180)stop();},250);
    } catch(e) { release(); busy.current=false; if(generation.current!==current)return;setStatus('idle');setError(e instanceof DOMException && e.name==='NotAllowedError' ? 'Microphone access was denied. You can allow it in your browser or type your answer.' : e instanceof Error ? e.message : 'Microphone recording failed.'); }
  };
  return {status,error,blob,url,seconds,start,stop};
}
