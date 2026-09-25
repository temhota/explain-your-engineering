"use client";
import Link from "next/link";
import { Menu, Tag, Typography } from "antd";
import { usePathname } from "next/navigation";
import { useTrainer } from "@/store/provider";
import styles from "./trainer.module.css";
export function Shell({
  children,
  live,
}: {
  children: React.ReactNode;
  live: boolean;
}) {
  const path = usePathname();
  const session = useTrainer((s) => s.session);
  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          Explain your engineering
        </Link>
        <nav aria-label="Main navigation" className={styles.nav}>
          <Menu
            mode="horizontal"
            selectedKeys={[path]}
            items={[
              { key: "/", label: <Link href="/">Practice</Link> },
              { key: "/history", label: <Link href="/history">History</Link> },
              ...(session
                ? [
                    {
                      key: "/session",
                      label: (
                        <Link href="/session">
                          {session.stage === "complete"
                            ? "Latest review"
                            : "Continue practice"}
                        </Link>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </nav>
      </header>
      <main id="main" tabIndex={-1} className={styles.content}>
        {children}
      </main>
      <footer className={styles.footer}>
        <Typography.Text type="secondary">
          Stored in this browser
        </Typography.Text>
        <Tag>{live ? "English · AI enabled" : "English · AI off"}</Tag>
      </footer>
    </div>
  );
}
