import type { Context, Feedback } from './domain';
export const demoContext: Context = { mode: 'technology', questionId: 'react-effects', version: 1, title: 'When an Effect is unnecessary', question: 'A component stores a filtered list in state and updates it in an Effect. How would you approach this?' };
export const demoAnswers = [
  'I would derive the filtered list during rendering instead of storing a second copy in state. In a fictional catalogue project, the list and search term were already available as inputs. This removed an extra render and kept the result consistent. I would only add memoization if measurement showed the calculation was expensive.',
  'I would profile the interaction with a realistic list size before adding useMemo. Memoization has its own complexity, so I would check the cost and dependency stability. I would also test an empty search and a changed list to ensure the results stay correct.',
];
export const demoFollowUp = 'You mentioned measurement before memoization. What would you measure, and what would make useMemo worthwhile?';
export const demoFeedback: Feedback = {
  communication: [
    { kind: 'strength', answer: 1, quote: 'I would derive the filtered list during rendering', observation: 'You lead with a direct decision before explaining the example.', action: 'Keep this answer-first structure in your next attempt.', sourceIds: [] },
    { kind: 'gap', answer: 2, quote: 'I would profile the interaction', observation: 'Your next step is clear, but the measurement is still broad.', action: 'Name the interaction and the render duration you would inspect.', sourceIds: [] },
  ],
  technical: [
    { kind: 'strength', answer: 1, quote: 'instead of storing a second copy in state', observation: 'You identify redundant state and explain why deriving a value is simpler.', action: 'Extend the explanation to how derived values avoid synchronization bugs.', sourceIds: ['react-effects'] },
    { kind: 'check', answer: 2, quote: 'dependency stability', observation: 'This is relevant to whether memoization can reuse a previous result.', action: 'Explain what happens when a dependency is a new object on every render.', sourceIds: ['react-effects'] },
  ],
};
export const sourceLinks: Record<string, { title: string; url: string }> = { 'react-effects': { title: 'React: You Might Not Need an Effect', url: 'https://react.dev/learn/you-might-not-need-an-effect' } };
