"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories } from "@/data/categories";
import { RomanNav } from "@/components/ui/RomanNav";
import { Wordmark } from "@/components/ui/Wordmark";

gsap.registerPlugin(ScrollTrigger);

export function IndexRail() {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState(categories[0].id);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    const railTrigger = ScrollTrigger.create({
      trigger: "#sidekick",
      start: "top 50%",
      onEnter: () => setVisible(true),
      onLeaveBack: () => setVisible(false),
    });
    triggers.push(railTrigger);

    categories.forEach((cat, index) => {
      const el = document.getElementById(cat.id);
      if (!el) return;
      // Production switches the interactive/rail chapter at the midpoint of
      // the incoming scene transition. Online onward begins crossfading 20vh
      // early, so its midpoint is 70% down the viewport rather than 50%.
      const earlyCrossfade = index >= 2 ? 0.2 : 0;
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: `top ${50 + earlyCrossfade * 100}%`,
        end: "bottom center",
        onEnter: () => setActiveId(cat.id),
        onLeaveBack: () =>
          setActiveId(categories[Math.max(0, index - 1)].id),
      });
      triggers.push(trigger);
    });

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      transition={{ duration: 0.3 }}
      className="fixed inset-y-0 left-0 z-40 hidden w-72 glg:block"
    >
      <div
        className="absolute top-16 left-5 text-white"
        style={{ mixBlendMode: "difference" }}
      >
        <Wordmark />
      </div>
      <div
        className="absolute bottom-8 left-5 w-56 text-white"
        style={{ mixBlendMode: "difference" }}
      >
        <RomanNav activeId={activeId} tone="dark" />
        <div className="mt-6 space-y-0.5 text-xs">
          <p>© Shopify Inc</p>
          <p className="underline">Terms of Service</p>
          <p className="underline">Privacy Policy</p>
        </div>
      </div>
    </motion.aside>
  );
}
