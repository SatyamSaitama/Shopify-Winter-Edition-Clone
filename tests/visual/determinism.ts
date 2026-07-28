import type { Page } from "@playwright/test";

declare global {
  interface Window {
    __tick?: (frames?: number) => number;
    __freezeMedia?: () => void;
  }
}

/**
 * Installs the same deterministic stimulus before every document script:
 * seeded randomness, a virtual 60fps clock, a pinned DPR, and frozen media.
 */
export async function installDeterminism(page: Page) {
  await page.addInitScript(() => {
    let seed = 0x9e3779b9;
    Math.random = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      value =
        (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };

    let now = 0;
    let nextFrameId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();

    Object.defineProperty(performance, "now", {
      configurable: true,
      value: () => now,
    });
    Date.now = () => 1_700_000_000_000 + now;
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      get: () => 1,
    });

    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      callbacks.set(++nextFrameId, callback);
      return nextFrameId;
    };
    window.cancelAnimationFrame = (handle: number) => {
      callbacks.delete(handle);
    };
    window.__tick = (frames = 1) => {
      const frameCount = Math.max(0, Math.floor(frames));
      for (let frame = 0; frame < frameCount; frame += 1) {
        now += 1000 / 60;
        const due = [...callbacks];
        callbacks.clear();
        for (const [, callback] of due) callback(now);
      }
      return now;
    };

    const freeze = (media: HTMLMediaElement) => {
      media.pause();
      const seek = () => {
        if (!Number.isFinite(media.duration) || media.duration <= 0) return;
        try {
          media.currentTime = Math.min(0.5, Math.max(0, media.duration - 0.05));
        } catch {
          // A browser may reject a seek until metadata is available.
        }
      };
      if (media.readyState >= HTMLMediaElement.HAVE_METADATA) seek();
      else media.addEventListener("loadedmetadata", seek, { once: true });
    };

    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: function playDeterministically(this: HTMLMediaElement) {
        freeze(this);
        return Promise.resolve();
      },
    });

    window.__freezeMedia = () => {
      document.querySelectorAll("video, audio").forEach((element) => {
        freeze(element as HTMLMediaElement);
      });
    };

    document.addEventListener(
      "DOMContentLoaded",
      () => {
        window.__freezeMedia?.();
        new MutationObserver(() => window.__freezeMedia?.()).observe(
          document.documentElement,
          { childList: true, subtree: true }
        );
      },
      { once: true }
    );
  });
}

export async function tickDeterministicFrames(page: Page, frames = 1) {
  return page.evaluate((count) => {
    if (typeof window.__tick !== "function") {
      throw new Error("Deterministic clock was not installed before navigation");
    }
    return window.__tick(count);
  }, frames);
}

export async function settleDeterministically(
  page: Page,
  frames = 30,
  batchSize = 5
) {
  let remaining = Math.max(0, Math.floor(frames));
  while (remaining > 0) {
    const batch = Math.min(remaining, Math.max(1, batchSize));
    await tickDeterministicFrames(page, batch);
    remaining -= batch;
    // Yield so fetch, image decode, IntersectionObserver, and React work can
    // enqueue callbacks for the next virtual frame.
    await page.waitForTimeout(0);
  }
}

export async function freezeMedia(page: Page) {
  await page.evaluate(() => window.__freezeMedia?.());
}
