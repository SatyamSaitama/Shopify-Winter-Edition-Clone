"use client";

import { categories } from "@/data/categories";

export function RomanNav({
  activeId,
  onNavigate,
  tone = "light",
}: {
  activeId?: string;
  onNavigate?: (id: string) => void;
  tone?: "light" | "dark";
}) {
  return (
    <ul className="space-y-0">
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <li key={cat.id}>
            <a
              href={`#${cat.id}`}
              onClick={() => onNavigate?.(cat.id)}
              className={[
                "flex items-baseline justify-between gap-3 text-base leading-[1.35] font-bold transition-colors",
                isActive
                  ? tone === "dark"
                    ? "text-white"
                    : "text-ink"
                  : tone === "dark"
                    ? "text-[#8a8a8a] hover:text-white"
                    : "text-stone hover:text-ink",
              ].join(" ")}
            >
              <span>{cat.name}</span>
              <span className="text-[11px] font-normal not-italic">
                {cat.numeral}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
