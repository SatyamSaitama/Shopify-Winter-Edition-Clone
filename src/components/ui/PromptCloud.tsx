"use client";

import { motion, useReducedMotion } from "framer-motion";

interface CloudItem {
  text: string;
  top: string;
  left: string;
  size?: "sm" | "md" | "lg";
  muted?: boolean;
}

const sizeClass: Record<NonNullable<CloudItem["size"]>, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const wordItem = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function PromptCloud({
  items,
  className = "",
}: {
  items: CloudItem[];
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={container}
      className={`relative h-105 w-full overflow-hidden ${className}`}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          variants={wordItem}
          style={{ top: item.top, left: item.left, maxWidth: "min(280px, 40vw)" }}
          className={`absolute font-serif italic leading-tight ${
            sizeClass[item.size ?? "sm"]
          } ${item.muted ? "text-ink/30" : "text-ink/80"}`}
        >
          {item.text}
        </motion.span>
      ))}
    </motion.div>
  );
}
