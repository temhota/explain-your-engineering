export type Topic = "JavaScript" | "TypeScript" | "React";
export interface PublicQuestion {
  id: string;
  version: number;
  topic: Topic;
  title: string;
  question: string;
  sourceIds: string[];
}
export const sources: Record<string, { title: string; url: string }> = {
  "js-closures": {
    title: "MDN: Closures",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
  },
  "js-promises": {
    title: "MDN: Using promises",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
  },
  "js-copy": {
    title: "MDN: Spread syntax",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax",
  },
  "js-all": {
    title: "MDN: Promise.all",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all",
  },
  "ts-narrowing": {
    title: "TypeScript: Narrowing",
    url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
  },
  "ts-generics": {
    title: "TypeScript: Generics",
    url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
  },
  "ts-runtime": {
    title: "TypeScript: Type assertions",
    url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions",
  },
  "react-state": {
    title: "React: State as a snapshot",
    url: "https://react.dev/learn/state-as-a-snapshot",
  },
  "react-keys": {
    title: "React: Preserving and resetting state",
    url: "https://react.dev/learn/preserving-and-resetting-state",
  },
  "react-effects": {
    title: "React: You Might Not Need an Effect",
    url: "https://react.dev/learn/you-might-not-need-an-effect",
  },
  "react-fetch": {
    title: "React: Fetching data with Effects",
    url: "https://react.dev/reference/react/useEffect#fetching-data-with-effects",
  },
};
