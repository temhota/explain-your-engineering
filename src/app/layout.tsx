import { AntdRegistry } from "@ant-design/nextjs-registry";
import { UIProvider } from "@/components/ui-provider";
import "antd/dist/reset.css";
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
        <AntdRegistry>
          <UIProvider>
            <TrainerProvider>
              <Shell live={process.env.AI_ENABLED === "true"}>{children}</Shell>
            </TrainerProvider>
          </UIProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
