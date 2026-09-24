import { it, expect } from 'vitest';
import { createTrainerStore } from './trainer';
const context={mode:'technology' as const,questionId:'js-closures',version:1,title:'Closures',question:'Explain a closure.'};
function memory(){const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);},removeItem:(key:string)=>{data.delete(key);}};}
it('restores a draft without restoring an in-flight request',async()=>{
 const storage=memory();const a=createTrainerStore(storage);await a.persist.rehydrate();a.getState().start(context,false);a.getState().editAnswer(1,'A retained lexical binding.');a.getState().confirmAnswer();a.getState().beginRequest('follow-up');
 const b=createTrainerStore(storage);expect(b.getState().session).toBeNull();await b.persist.rehydrate();
 expect(b.getState().session?.answer1).toBe('A retained lexical binding.');expect(b.getState().request).toBeNull();expect(b.getState().hydrated).toBe(true);
});
it('reports corrupted storage instead of silently treating it as a saved session',async()=>{
 const storage=memory();storage.setItem('eye-practice','{"version":1,"state":{"session":"broken"}}');
 const store=createTrainerStore(storage);await store.persist.rehydrate();await Promise.resolve();
 expect(store.getState().storageError).toMatch(/saved|storage|data/i);expect(store.getState().hydrated).toBe(true);
});
it('reports write failure while retaining the current answer in memory',async()=>{
 const storage=memory();storage.setItem=()=>{throw new Error('Quota');};
 const store=createTrainerStore(storage);await store.persist.rehydrate();store.getState().start(context,false);await Promise.resolve();
 expect(store.getState().session?.context.title).toBe('Closures');expect(store.getState().storageError).toBeTruthy();
});
it('keeps an experience snapshot after editing or deleting its source card',()=>{
 const store=createTrainerStore();const card={id:'card',title:'Search',context:'Catalogue',role:'Frontend',constraints:'Slow devices',decision:'Derive values',result:'Less state'};
 store.getState().saveExperience(card);store.getState().start({mode:'experience',title:card.title,question:'Explain a decision.',experience:card},false);
 store.getState().saveExperience({...card,decision:'Different'});store.getState().deleteExperience('card');
 const saved=store.getState().session!.context;expect(saved.mode==='experience'&&saved.experience.decision).toBe('Derive values');
});
