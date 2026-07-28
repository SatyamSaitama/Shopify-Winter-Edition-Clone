"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export function StaggerGroup({ className, ...props }: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={container}
      className={className}
      {...props}
    />
  );
}

export function StaggerItem({ className, ...props }: HTMLMotionProps<"div">) {
  return <motion.div variants={cardItem} className={className} {...props} />;
}
