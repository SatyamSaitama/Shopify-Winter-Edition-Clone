import { test, expect } from "./fixtures";
import {
  fullScrollPage,
  gotoVisualTarget,
  jsonAttachment,
} from "./helpers";

interface WebglContextRecord {
  contextId: string;
  owner: "scene" | "other";
  detail: string;
}

declare global {
  interface Window {
    __webglAudit?: {
      contexts: WebglContextRecord[];
      contextLostEvents: number;
    };
  }
}

/**
 * The gate guards the per-section renderer regression: the scene layer must
 * own exactly one context no matter how many chapters are mounted.
 *
 * It is deliberately not a page-wide count of one. The Rive runtime allocates
 * its own context, and because every player is constructed with
 * `useOffscreenRenderer: true` all 21 rive-containers share that single
 * context. Holding third-party contexts to <= 1 therefore still fails if the
 * players stop sharing a renderer.
 */
test("one WebGL context survives a complete scroll", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const seen = new WeakSet<object>();
    const audit = {
      contexts: [] as WebglContextRecord[],
      contextLostEvents: 0,
    };
    window.__webglAudit = audit;

    HTMLCanvasElement.prototype.getContext = function auditedGetContext(
      this: HTMLCanvasElement,
      contextId: string,
      ...args: unknown[]
    ) {
      const context = originalGetContext.call(
        this,
        contextId as "2d",
        ...args
      ) as RenderingContext | null;
      if (
        context &&
        ["webgl", "webgl2", "experimental-webgl"].includes(contextId) &&
        !seen.has(context as object)
      ) {
        seen.add(context as object);
        const inSceneLayer = Boolean(this.closest("#scene-portal"));
        audit.contexts.push({
          contextId,
          owner: inSceneLayer ? "scene" : "other",
          detail: inSceneLayer
            ? "#scene-portal"
            : (this.className ||
                this.parentElement?.className ||
                "detached canvas"),
        });
      }
      return context;
    } as typeof HTMLCanvasElement.prototype.getContext;

    window.addEventListener(
      "webglcontextlost",
      () => {
        audit.contextLostEvents += 1;
      },
      true
    );
  });

  await gotoVisualTarget(page);
  const scroll = await fullScrollPage(page, {
    step: 900,
    framesPerStop: 1,
    settleFrames: 15,
  });
  const audit = await page.evaluate(() => ({
    ...window.__webglAudit,
    canvasElementsInDom: document.querySelectorAll("canvas").length,
  }));
  const contexts = audit.contexts ?? [];
  const sceneContexts = contexts.filter((entry) => entry.owner === "scene");
  const otherContexts = contexts.filter((entry) => entry.owner !== "scene");
  const report = { scroll, audit, sceneContexts, otherContexts };
  await testInfo.attach("webgl-contexts.json", jsonAttachment(report));

  expect
    .soft(sceneContexts.length, "WebGL contexts created by the scene layer")
    .toBe(1);
  expect
    .soft(
      otherContexts.length,
      "third-party WebGL contexts (Rive shares one offscreen renderer)"
    )
    .toBeLessThanOrEqual(1);
  expect
    .soft(audit.contextLostEvents, "webglcontextlost events")
    .toBe(0);
});
