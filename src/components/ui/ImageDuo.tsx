"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GhostButton } from "./Button";
import { StaggerGroup, StaggerItem } from "./Stagger";

interface Panel {
  title: string;
  description: string;
  bg: string;
  image?: string;
  imageAlt?: string;
  prompt?: string;
  ctaLabel?: string;
}

function PanelBlock({ panel }: { panel: Panel }) {
  return (
    <StaggerItem>
      <div
        className={`relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-md ${panel.bg}`}
      >
        {panel.image && (
          <Image
            src={panel.image}
            alt={panel.imageAlt ?? ""}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        )}
        {panel.prompt && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
            className="absolute bottom-6 left-1/2 w-[85%] -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-lg bg-white/95 p-3 shadow-card">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs">
                🤖
              </span>
              <p className="flex-1 text-xs leading-snug text-ink">
                {panel.prompt}
              </p>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M6 10V2M6 2L2 6M6 2L10 6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </motion.div>
        )}
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">{panel.title}</p>
      <p className="mt-1 text-sm text-slate">{panel.description}</p>
      <div className="mt-3">
        <GhostButton>{panel.ctaLabel ?? "Read help doc"}</GhostButton>
      </div>
    </StaggerItem>
  );
}

export function ImageDuo({ left, right }: { left: Panel; right: Panel }) {
  return (
    <StaggerGroup className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <PanelBlock panel={left} />
      <PanelBlock panel={right} />
    </StaggerGroup>
  );
}
