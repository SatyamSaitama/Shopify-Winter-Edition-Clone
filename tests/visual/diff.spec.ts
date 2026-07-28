import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { test, expect } from "./fixtures";
import { gotoVisualTarget, jsonAttachment } from "./helpers";
import { captureDeterministicScreenshot } from "./screenshot";

const testBaselinePath = path.resolve(
  "tests/visual/baselines/home-top-1728x1080.png"
);
const sourceReferencePath = path.resolve(
  "reference/geometry-screenshots/target-top.png"
);
const baselinePath = process.env.VISUAL_BASELINE_PATH
  ? path.resolve(process.env.VISUAL_BASELINE_PATH)
  : existsSync(sourceReferencePath)
    ? sourceReferencePath
    : testBaselinePath;
const configuredLimit = Number(
  process.env.VISUAL_MAX_MISMATCH_RATIO ?? "0.001"
);

test("deterministic top-viewport pixels match the checked-in baseline", async ({
  page,
}, testInfo) => {
  test.skip(
    !existsSync(baselinePath),
    `No source baseline found; set VISUAL_BASELINE_PATH or add ${testBaselinePath}`
  );
  if (!Number.isFinite(configuredLimit) || configuredLimit < 0) {
    throw new Error(
      `Invalid VISUAL_MAX_MISMATCH_RATIO: ${process.env.VISUAL_MAX_MISMATCH_RATIO}`
    );
  }

  await gotoVisualTarget(page);
  const actualPath = testInfo.outputPath("home-top-actual.png");
  const diffPath = testInfo.outputPath("home-top-diff.png");
  await captureDeterministicScreenshot(page, actualPath, {
    scrollY: 0,
    // The approved source frame is the settled Hero state after its authored
    // five-second non-scroll intro, so advance the virtual 60fps clock past
    // that sequence before comparing pixels.
    frames: 360,
  });

  const baseline = PNG.sync.read(await readFile(baselinePath));
  const actual = PNG.sync.read(await readFile(actualPath));
  expect(
    { width: actual.width, height: actual.height },
    "actual screenshot dimensions"
  ).toEqual({ width: baseline.width, height: baseline.height });

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const mismatchedPixels = pixelmatch(
    baseline.data,
    actual.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0.1 }
  );
  const totalPixels = baseline.width * baseline.height;
  const mismatchRatio = mismatchedPixels / totalPixels;
  await writeFile(diffPath, PNG.sync.write(diff));

  const metrics = {
    baseline: baselinePath,
    width: baseline.width,
    height: baseline.height,
    mismatchedPixels,
    totalPixels,
    mismatchRatio,
    allowedMismatchRatio: configuredLimit,
  };
  await testInfo.attach("pixel-diff.json", jsonAttachment(metrics));
  await testInfo.attach("actual", {
    path: actualPath,
    contentType: "image/png",
  });
  await testInfo.attach("diff", {
    path: diffPath,
    contentType: "image/png",
  });

  expect(mismatchRatio).toBeLessThanOrEqual(configuredLimit);
});
