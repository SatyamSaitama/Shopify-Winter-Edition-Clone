import { test, expect } from "./fixtures";
import { gotoVisualTarget } from "./helpers";
import { tickDeterministicFrames } from "./determinism";

test("captured navigation, video modal, and Sidekick cloud are interactive", async ({
  page,
}) => {
  await gotoVisualTarget(page);

  const editionsButton = page
    .locator('[data-component-name="all-editions-dropdown"]')
    .first();
  const editionsPanel = page.locator(
    "#all-editions-dropdown-expandable-section"
  );
  await editionsButton.click();
  await expect(editionsButton).toHaveAttribute("aria-expanded", "true");
  await expect(editionsPanel).toHaveAttribute("aria-hidden", "false");
  await editionsButton.click();
  await expect(editionsButton).toHaveAttribute("aria-expanded", "false");

  const videoLauncher = page
    .locator('[data-component-name="cta-open-video-modal"]')
    .first();
  await videoLauncher.scrollIntoViewIfNeeded();
  await tickDeterministicFrames(page, 5);
  await videoLauncher.click({ force: true });

  const videoModal = page.locator('[data-component-name="video-modal"]');
  // The modal is toggled by the `hidden` class token. Match the token itself:
  // the static class list contains `overflow-hidden`, which a `\bhidden\b`
  // regex over the whole attribute would match on a hyphen boundary.
  const modalHidden = () =>
    videoModal.evaluate((element) => element.classList.contains("hidden"));

  await expect.poll(modalHidden, { timeout: 10_000 }).toBe(false);
  await expect(videoModal).toHaveAttribute(
    "data-component-extra-product-handle",
    "sidekick-video"
  );
  await expect(videoModal.locator("iframe")).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/LU4tghjdnG8/
  );
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");

  await page.keyboard.press("Escape");
  await expect.poll(modalHidden, { timeout: 10_000 }).toBe(true);
  await expect(videoModal.locator("iframe")).toHaveCount(0);

  const cloudRoot = page.locator(".cloud-card").first().locator("..");
  await cloudRoot.scrollIntoViewIfNeeded();
  await tickDeterministicFrames(page, 5);
  await expect
    .poll(() =>
      page
        .locator(".cloud-card-interactive")
        .first()
        .getAttribute("data-cloud-entered")
    )
    .toBe("true");
});
