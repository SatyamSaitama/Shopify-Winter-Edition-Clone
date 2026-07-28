import type { Page } from "@playwright/test";
import { freezeMedia, settleDeterministically } from "./determinism";

export async function captureDeterministicScreenshot(
  page: Page,
  path: string,
  options: {
    scrollY?: number;
    frames?: number;
    fullPage?: boolean;
  } = {}
) {
  await page.evaluate((scrollY) => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });

    // Browser/dev overlays are test-runner UI, not page pixels.
    document
      .querySelectorAll("nextjs-portal, [data-next-badge-root]")
      .forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });
  }, options.scrollY ?? 0);

  await freezeMedia(page);
  await settleDeterministically(page, options.frames ?? 30);
  await page.evaluate(async () => {
    if ("fonts" in document) await document.fonts.ready;
    const visibleImages = [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    });
    await Promise.all(
      visibleImages.map(async (image) => {
        if (!image.complete) {
          await Promise.race([
            new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
            new Promise<void>((resolve) => setTimeout(resolve, 5_000)),
          ]);
        }
        if (image.complete && image.naturalWidth > 0) {
          await image.decode().catch(() => undefined);
        }
      })
    );
  });

  await page.screenshot({
    path,
    fullPage: options.fullPage ?? false,
    animations: "disabled",
    caret: "hide",
    scale: "css",
  });
}
