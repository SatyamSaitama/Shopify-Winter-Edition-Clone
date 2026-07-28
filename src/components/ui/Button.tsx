import type { ReactNode } from "react";

function ArrowUpRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M2 8L8 2M8 2H3M8 2V7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GhostButton({
  children,
  href,
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href ?? "#"}
      className="inline-flex items-center gap-1.5 rounded-sm border border-ink/25 bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      {children}
      <ArrowUpRight />
    </a>
  );
}

export function PillButton({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink transition-transform hover:scale-[1.03]">
      {children}
    </button>
  );
}
