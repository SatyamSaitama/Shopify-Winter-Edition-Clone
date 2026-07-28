import type { ReactNode } from "react";

export function DotCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex aspect-square max-w-md items-center justify-center rounded-md border border-ink/10 bg-[radial-gradient(circle,_rgba(41,41,25,0.18)_1px,_transparent_1px)] bg-[length:16px_16px]"
    >
      {children}
    </div>
  );
}
