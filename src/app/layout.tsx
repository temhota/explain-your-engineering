import type { Metadata } from "next";
import { TrainerProvider } from "@/store/provider";
import { Shell } from "@/components/shell";
import "./globals.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Explain Your Engineering",
  description:
    "Practise explaining technical decisions in English. Questions, spoken or written answers, and feedback.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TrainerProvider>
          <Shell live={process.env.AI_ENABLED === "true"}>{children}</Shell>
        </TrainerProvider>
      </body>
    </html>
  );
}
