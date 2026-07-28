import { test, expect } from "./fixtures";
import {
  fullScrollPage,
  gotoVisualTarget,
  jsonAttachment,
  VISUAL_TARGET_URL,
} from "./helpers";

test("DOM content parity: 345 images, 294 links, 200 products, 12 videos", async ({
  page,
}, testInfo) => {
  await gotoVisualTarget(page, { settleFrames: 8 });

  const counts = await page.evaluate(() => ({
    images: document.images.length,
    links: document.links.length,
    products: document.querySelectorAll(
      'article[data-component-name="product"]'
    ).length,
    videos: document.querySelectorAll("video").length,
  }));
  await testInfo.attach("dom-parity.json", jsonAttachment(counts));

  expect.soft(counts.images, "rendered <img> count").toBe(345);
  expect.soft(counts.links, "rendered anchors with href").toBe(294);
  expect.soft(counts.products, "product article count").toBe(200);
  expect.soft(counts.videos, "rendered <video> count").toBe(12);
});

test("all runtime and DOM asset URLs are local", async ({ page }, testInfo) => {
  const allowedURL = new URL(VISUAL_TARGET_URL);
  const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
  const isAllowedURL = (candidate: URL) =>
    candidate.origin === allowedURL.origin ||
    (loopbackHosts.has(candidate.hostname) &&
      loopbackHosts.has(allowedURL.hostname) &&
      candidate.protocol === allowedURL.protocol &&
      candidate.port === allowedURL.port);
  const remoteRequests = new Set<string>();

  page.on("request", (request) => {
    const url = request.url();
    if (!/^https?:/i.test(url)) return;
    if (!isAllowedURL(new URL(url))) remoteRequests.add(url);
  });

  await gotoVisualTarget(page);
  const scroll = await fullScrollPage(page);

  const remoteDomAssets = await page.evaluate((localTarget) => {
    const allowed = new URL(localTarget);
    const loopbacks = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
    const isAllowed = (candidate: URL) =>
      candidate.origin === allowed.origin ||
      (loopbacks.has(candidate.hostname) &&
        loopbacks.has(allowed.hostname) &&
        candidate.protocol === allowed.protocol &&
        candidate.port === allowed.port);
    const findings: {
      element: string;
      attribute: string;
      value: string;
    }[] = [];
    const checks: [string, string[]][] = [
      ["img", ["src", "srcset"]],
      ["source", ["src", "srcset"]],
      ["video", ["src", "poster"]],
      ["audio", ["src"]],
      ["track", ["src"]],
      ["script", ["src"]],
      ['link[rel~="stylesheet"], link[rel~="preload"], link[rel~="icon"]', [
        "href",
      ]],
      ["object", ["data"]],
      ["embed", ["src"]],
    ];

    const inspectValue = (
      element: Element,
      attribute: string,
      rawValue: string
    ) => {
      const candidates =
        attribute === "srcset"
          ? rawValue.split(",").map((part) => part.trim().split(/\s+/)[0])
          : [rawValue];
      for (const candidate of candidates) {
        if (!candidate || /^(data:|blob:|#)/i.test(candidate)) continue;
        try {
          const url = new URL(candidate, location.href);
          if (/^https?:$/i.test(url.protocol) && !isAllowed(url)) {
            findings.push({
              element: element.tagName.toLowerCase(),
              attribute,
              value: candidate,
            });
          }
        } catch {
          // Invalid URLs are handled by browser console/error gates.
        }
      }
    };

    for (const [selector, attributes] of checks) {
      document.querySelectorAll(selector).forEach((element) => {
        for (const attribute of attributes) {
          const value = element.getAttribute(attribute);
          if (value) inspectValue(element, attribute, value);
        }
      });
    }

    document.querySelectorAll<HTMLElement>("[style]").forEach((element) => {
      const style = element.getAttribute("style") ?? "";
      for (const match of style.matchAll(/url\((['"]?)(.*?)\1\)/gi)) {
        inspectValue(element, "style", match[2]);
      }
    });

    document.querySelectorAll<HTMLElement>("body *").forEach((element) => {
      for (const pseudo of [null, "::before", "::after"] as const) {
        const background = getComputedStyle(element, pseudo).backgroundImage;
        for (const match of background.matchAll(
          /url\((['"]?)(.*?)\1\)/gi
        )) {
          inspectValue(
            element,
            pseudo ? `${pseudo} background-image` : "background-image",
            match[2]
          );
        }
      }
    });

    return findings;
  }, VISUAL_TARGET_URL);

  const report = {
    allowedOrigin: allowedURL.origin,
    scroll,
    remoteRequests: [...remoteRequests].sort(),
    remoteDomAssets,
  };
  await testInfo.attach("remote-assets.json", jsonAttachment(report));

  expect(report.remoteRequests, "cross-origin runtime requests").toEqual([]);
  expect(report.remoteDomAssets, "cross-origin DOM/CSS asset URLs").toEqual([]);
});
