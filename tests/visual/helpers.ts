import type { Page } from "@playwright/test";
import {
  freezeMedia,
  settleDeterministically,
  tickDeterministicFrames,
} from "./determinism";

export const VISUAL_TARGET_URL =
  process.env.PLAYWRIGHT_BASE_URL?.trim() || "http://localhost:3000";

export async function gotoVisualTarget(
  page: Page,
  options: {
    settleFrames?: number;
    waitForNetworkIdle?: boolean;
  } = {}
) {
  const response = await page.goto(VISUAL_TARGET_URL, {
    waitUntil: "domcontentloaded",
  });
  if (!response) throw new Error(`No navigation response for ${VISUAL_TARGET_URL}`);
  if (!response.ok()) {
    throw new Error(
      `Navigation failed: ${response.status()} ${response.statusText()}`
    );
  }

  await settleDeterministically(page, options.settleFrames ?? 12);
  if (options.waitForNetworkIdle ?? true) {
    await page.waitForLoadState("networkidle");
  }
  await page.evaluate(async () => {
    if ("fonts" in document) await document.fonts.ready;
  });
  await freezeMedia(page);
  await settleDeterministically(page, options.settleFrames ?? 12);
}

export interface FullScrollResult {
  scrollHeight: number;
  maxScrollY: number;
  stops: number;
}

/**
 * Walks the complete document in fixed increments. This deliberately visits
 * every lazy-mount margin instead of jumping directly to the bottom.
 */
export async function fullScrollPage(
  page: Page,
  options: {
    step?: number;
    framesPerStop?: number;
    settleFrames?: number;
  } = {}
): Promise<FullScrollResult> {
  const step = Math.max(100, options.step ?? 900);
  const framesPerStop = Math.max(1, options.framesPerStop ?? 1);
  let stops = 0;
  let targetY = 0;
  let latest = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await tickDeterministicFrames(page, framesPerStop);

  while (stops < 2_000) {
    const maxScrollY = Math.max(0, latest.scrollHeight - latest.viewportHeight);
    if (targetY >= maxScrollY) break;
    targetY = Math.min(maxScrollY, targetY + step);

    latest = await page.evaluate((top) => {
      window.scrollTo({ top, left: 0, behavior: "instant" });
      return {
        scrollHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
      };
    }, targetY);
    await tickDeterministicFrames(page, framesPerStop);
    await page.waitForTimeout(10);
    stops += 1;
  }

  if (stops >= 2_000) {
    throw new Error("Full-scroll safety limit reached; document height is unstable");
  }

  await page.waitForLoadState("networkidle");
  await freezeMedia(page);
  await settleDeterministically(page, options.settleFrames ?? 15);

  const finalMetrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    maxScrollY: Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    ),
  }));

  return { ...finalMetrics, stops };
}

export function jsonAttachment(value: unknown) {
  return {
    body: Buffer.from(JSON.stringify(value, null, 2)),
    contentType: "application/json",
  };
}
