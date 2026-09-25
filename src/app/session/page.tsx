import { SessionPanel } from "@/components/session-panel";
export const dynamic = "force-dynamic";
export default function Page() {
  return <SessionPanel live={process.env.AI_ENABLED === "true"} />;
}
