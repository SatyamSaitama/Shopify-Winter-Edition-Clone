import type { ReactNode } from "react";

export function BrowserFrame({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg shadow-card">
      <div className="flex items-center gap-3 bg-[#e4e4da] px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 truncate rounded-xs bg-white/70 px-2 py-0.5 text-center text-[11px] text-ink/50">
          {url}
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}
