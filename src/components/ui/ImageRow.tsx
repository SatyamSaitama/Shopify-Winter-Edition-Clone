import type { ReactNode } from "react";
import { GhostButton } from "./Button";
import { StaggerGroup, StaggerItem } from "./Stagger";

interface Panel {
  title: string;
  description: string;
  media: ReactNode;
  ctaLabel?: string;
}

export function ImageRow({ panels }: { panels: Panel[] }) {
  const cols =
    panels.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <StaggerGroup className={`grid grid-cols-1 gap-8 ${cols}`}>
      {panels.map((panel, i) => (
        <StaggerItem key={i}>
          <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-md bg-putty">
            {panel.media}
          </div>
          <p className="mt-4 text-sm font-semibold text-ink">{panel.title}</p>
          <p className="mt-1 text-sm text-slate">{panel.description}</p>
          {panel.ctaLabel && (
            <div className="mt-3">
              <GhostButton>{panel.ctaLabel}</GhostButton>
            </div>
          )}
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
