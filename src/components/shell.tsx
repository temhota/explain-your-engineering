"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, Grid2X2, MessageSquare, History } from "lucide-react";
import styles from "./trainer.module.css";
export function Shell({
  children,
  live,
}: {
  children: React.ReactNode;
  live: boolean;
}) {
  const path = usePathname();
  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon}>
            <AudioLines size={25} />
          </span>
          <span>
            Explain your
            <br />
            engineering<small>THE PRACTICE ROOM</small>
          </span>
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          {[
            { href: "/", label: "Practice", icon: Grid2X2 },
            { href: "/session", label: "Your session", icon: MessageSquare },
            { href: "/history", label: "History", icon: History },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.statusDot} />
          {live ? "Personal practice" : "Demo mode"}
          <p>
            A small space to find
            <br />
            the words for what you know.
          </p>
        </div>
      </aside>
      <div className={styles.main}>
        <header className={styles.topbar}>
          <span>YOUR NEXT INTERVIEW STARTS HERE</span>
          <strong>English · {live ? "Live AI enabled" : "Demo mode"}</strong>
        </header>
        <main id="main" className={styles.content}>
          {children}
          <footer className={styles.footer}>
            <span>Built for thoughtful engineers.</span>
            <span>Practice the explanation. Keep the curiosity.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
