"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface Coin {
  left: string;
  size: number;
  delay: number;
  duration: number;
}

function generateCoins(count: number): Coin[] {
  return Array.from({ length: count }).map(() => ({
    left: `${Math.random() * 90 + 5}%`,
    size: Math.random() * 10 + 8,
    delay: Math.random() * 6,
    duration: Math.random() * 3 + 4,
  }));
}

export function FallingCoins({ count = 14 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    // Randomized positions must be generated client-side only to avoid an
    // SSR/hydration mismatch; this is a decorative, non-interactive effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoins(generateCoins(count));
  }, [count]);

  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {coins.map((c, i) => (
        <span
          key={i}
          className="absolute top-[-10%] rounded-full bg-linear-to-br from-yellow-200 via-yellow-400 to-yellow-600 opacity-0 shadow-[0_0_8px_rgba(250,204,21,0.6)]"
          style={{
            left: c.left,
            width: c.size,
            height: c.size,
            animation: `coin-fall ${c.duration}s linear ${c.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes coin-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          8% { opacity: 0.9; }
          92% { opacity: 0.9; }
          100% { transform: translateY(120vh) rotate(320deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
