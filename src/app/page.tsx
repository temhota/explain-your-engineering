import { Practice } from "@/components/practice";
import { publicQuestions } from "@/server/questions";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Practice
      questions={publicQuestions()}
      live={process.env.AI_ENABLED === "true"}
    />
  );
}
