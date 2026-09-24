'use client';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useTrainer } from '@/store/provider';
import { demoContext } from '@/lib/demo';
import styles from './trainer.module.css';
export function Practice() {
 const start = useTrainer(s => s.start); const router = useRouter();
 const launch = () => { start(demoContext, true); router.push('/session'); };
 return <><section className={styles.hero}><div><p className={styles.eyebrow}>Small sessions. Clearer thinking.</p><h1>You know your craft.<br/>Find the words for it.</h1><p>Practise explaining technical decisions, handle the follow-up, and leave with one thing to improve.</p></div><div className={styles.heroBadge}><strong>5–8</strong><span>minutes of practice</span></div></section><section className={styles.feature}><div><p className={styles.eyebrow}>Take a look inside</p><h2>One question. A little deeper.</h2><p>Walk through a fictional React interview, from first answer to useful feedback.</p></div><button className={styles.primary} onClick={launch}>Try the example <ArrowRight size={16}/></button></section><div className={styles.sectionHeading}><h2>Choose your starting point</h2><span className={styles.muted}>A thoughtful answer beats a memorised one.</span></div><div className={styles.grid}>{[{ name:'JavaScript', symbol:'JS', text:'Explain the language behind the behaviour. Closures, async work and everyday trade-offs.' },{name:'TypeScript',symbol:'TS',text:'Make your reasoning explicit. Types, boundaries and the guarantees they can give.'},{name:'React',symbol:'↗',text:'Go beyond the happy path. State, rendering and keeping your interface in sync.'}].map(topic => <article key={topic.name} className={styles.topicCard}><span className={styles.topicIcon}>{topic.symbol}</span><h3>{topic.name}</h3><p>{topic.text}</p><button className={styles.secondary} onClick={launch}>Explore the example <ArrowRight size={14}/></button></article>)}</div><p className={styles.bottomNote}><ShieldCheck size={16}/>Your practice stays in this browser. No account. No leaderboard.</p></>;
}
