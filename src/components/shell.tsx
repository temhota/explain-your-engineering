"use client";
import Link from "next/link";
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
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" aria-current={path === "/" ? "page" : undefined}>
            Practice
          </Link>
          <Link
            href="/history"
            aria-current={path === "/history" ? "page" : undefined}
          >
            History
          </Link>
          {session && (
            <Link
              href="/session"
              aria-current={path === "/session" ? "page" : undefined}
            >
              {session.stage === "complete"
                ? "Latest review"
                : "Continue practice"}
            </Link>
          )}
        </nav>
      </header>
      <main id="main" tabIndex={-1} className={styles.content}>
        {children}
      </main>
      <footer className={styles.footer}>
        <span>Saved in this browser</span>
        <span>{live ? "English · AI enabled" : "English · AI off"}</span>
      </footer>
    </div>
  );
}
