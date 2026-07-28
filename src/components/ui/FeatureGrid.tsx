"use client";

import { motion, useReducedMotion } from "framer-motion";

interface GridItem {
  title: string;
  body: string;
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function FeatureGrid({ items }: { items: GridItem[] }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={container}
      className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2"
    >
      {items.map((it, i) => (
        <motion.div
          key={i}
          variants={item}
          className="grid grid-cols-[minmax(0,160px)_1fr] gap-6"
        >
          <p className="text-sm font-semibold text-ink">{it.title}</p>
          <p className="text-sm text-slate">{it.body}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
