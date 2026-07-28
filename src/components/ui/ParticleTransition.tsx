"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface BurstParticle {
  angle: number;
  distance: number;
  drift: number;
  size: number;
  phase: number;
  light: boolean;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

export function ParticleTransition() {
  const reduce = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduce) return;
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!wrapper || !canvas || !context) return;

    let seed = 0x6d2b79f5;
    const random = () => {
      seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
      return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
    };
    const particles: BurstParticle[] = Array.from({ length: 520 }, () => ({
      angle: random() * Math.PI * 2,
      distance: 0.12 + Math.pow(random(), 0.6) * 0.88,
      drift: (random() - 0.5) * 1.8,
      size: 0.4 + Math.pow(random(), 2) * 3.2,
      phase: random() * Math.PI * 2,
      light: random() > 0.42,
    }));

    let width = 0;
    let height = 0;
    let ratio = 1;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      ratio = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();

    let raf = 0;
    const render = (now: number) => {
      context.clearRect(0, 0, width, height);
      const rect = wrapper.getBoundingClientRect();
      const progress = clamp(
        (height - rect.top) / Math.max(1, height + rect.height)
      );
      const active = progress > 0.001 && progress < 0.999;

      if (active) {
        const burst = easeOutCubic(clamp((progress - 0.12) / 0.7));
        const fade = Math.sin(clamp((progress - 0.04) / 0.92) * Math.PI);
        const centerX = width * 0.5;
        const centerY = height * 0.52;
        const radius = Math.hypot(width, height) * 0.68 * burst;

        const flash = context.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          Math.max(1, radius * 0.72)
        );
        flash.addColorStop(0, `rgba(255,255,245,${0.22 * fade})`);
        flash.addColorStop(0.25, `rgba(255,248,220,${0.09 * fade})`);
        flash.addColorStop(1, "rgba(255,255,255,0)");
        context.fillStyle = flash;
        context.fillRect(0, 0, width, height);

        for (const particle of particles) {
          const turbulence =
            Math.sin(now * 0.0018 + particle.phase + burst * 8) *
            particle.drift *
            14;
          const travel = radius * particle.distance;
          const x =
            centerX +
            Math.cos(particle.angle) * travel +
            Math.cos(particle.angle + Math.PI / 2) * turbulence;
          const y =
            centerY +
            Math.sin(particle.angle) * travel * 0.72 +
            Math.sin(particle.angle + Math.PI / 2) * turbulence;
          const localFade =
            fade *
            clamp((burst - particle.distance * 0.18) * 2.2) *
            (0.45 + 0.55 * Math.sin(now * 0.004 + particle.phase) ** 2);
          if (localFade <= 0.01) continue;

          context.globalAlpha = localFade;
          context.fillStyle = particle.light ? "#fffdf1" : "#090807";
          context.beginPath();
          context.arc(x, y, particle.size, 0, Math.PI * 2);
          context.fill();

          if (particle.light && particle.size > 2.2) {
            context.globalAlpha = localFade * 0.35;
            context.fillRect(x - particle.size * 4, y, particle.size * 8, 0.6);
            context.fillRect(x, y - particle.size * 4, 0.6, particle.size * 8);
          }
        }
        context.globalAlpha = 1;
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none relative z-30 -my-32 h-64"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-30"
      />
    </div>
  );
}
