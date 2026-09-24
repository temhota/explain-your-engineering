import type { Metadata } from 'next';
import { TrainerProvider } from '@/store/provider';
import { Shell } from '@/components/shell';
import './globals.css';
export const metadata: Metadata = { title: 'Explain Your Engineering — The practice room', description: 'Find the words for what you know. Practise technical interviews through clear answers and thoughtful follow-up questions.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return <html lang="en"><body><TrainerProvider><Shell live={process.env.AI_ENABLED === 'true'}>{children}</Shell></TrainerProvider></body></html>;
}
