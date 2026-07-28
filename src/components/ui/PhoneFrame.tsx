import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-[2rem] border-4 border-black/80 bg-white shadow-card">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 text-[10px] text-ink">
        <span>9:41</span>
        <span>●●●●</span>
      </div>
      {children}
    </div>
  );
}
