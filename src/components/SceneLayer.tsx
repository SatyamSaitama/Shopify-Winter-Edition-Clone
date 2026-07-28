"use client";

import { SceneCompositor } from "@/components/ui/SceneCompositor";

/**
 * The source page owns one persistent renderer. Every chapter is assembled as
 * a detached THREE.Scene inside SceneCompositor and only the three-scene
 * prev/current/next window remains mounted.
 */
export function SceneLayer() {
  return <SceneCompositor />;
}
