import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import {
  evalObjectAt,
  type TheatreProjectState,
} from "../../src/lib/theatreTrack";

type Keyframe = {
  position: number;
  value: number;
  handles: [number, number, number, number];
};

type Track = {
  type: "BasicKeyframedTrack";
  keyframes: Keyframe[];
};

const EPSILON = 1e-6;

function referenceBezier(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivativeX = (t: number) =>
    (3 * ax * t + 2 * bx) * t + cx;

  let solvedT = x;
  for (let i = 0; i < 8; i++) {
    const error = sampleX(solvedT) - x;
    if (Math.abs(error) < EPSILON) return sampleY(solvedT);
    const derivative = sampleDerivativeX(solvedT);
    if (Math.abs(derivative) < EPSILON) break;
    solvedT -= error / derivative;
  }

  let lower = 0;
  let upper = 1;
  solvedT = x;
  if (solvedT < lower) return sampleY(lower);
  if (solvedT > upper) return sampleY(upper);

  while (lower < upper) {
    const sampledX = sampleX(solvedT);
    if (Math.abs(sampledX - x) < EPSILON) return sampleY(solvedT);
    if (x > sampledX) {
      lower = solvedT;
    } else {
      upper = solvedT;
    }
    solvedT = (upper - lower) * 0.5 + lower;
  }
  return sampleY(solvedT);
}

function referenceTrackValue(track: Track, time: number): number {
  const keyframes = track.keyframes;
  if (keyframes.length === 0) return 0;
  if (time <= keyframes[0].position) return keyframes[0].value;
  if (time >= keyframes[keyframes.length - 1].position) {
    return keyframes[keyframes.length - 1].value;
  }

  for (let index = 0; index < keyframes.length - 1; index++) {
    const left = keyframes[index];
    const right = keyframes[index + 1];
    if (time < left.position || time > right.position) continue;

    const progress =
      (time - left.position) / (right.position - left.position || 1);
    const eased = referenceBezier(
      progress,
      left.handles[2],
      left.handles[3],
      right.handles[0],
      right.handles[1]
    );
    return left.value + (right.value - left.value) * eased;
  }

  return keyframes[keyframes.length - 1].value;
}

function makeState(keyframes: Keyframe[]): TheatreProjectState {
  return {
    sheetsById: {
      Scene: {
        sequence: {
          length: 1,
          tracksByObject: {
            probe: {
              trackIdByPropPath: {
                '["value"]': "value-track",
              },
              trackData: {
                "value-track": {
                  type: "BasicKeyframedTrack",
                  keyframes,
                },
              },
            },
          },
        },
      },
    },
  };
}

function evaluatedValue(state: TheatreProjectState, time: number): number {
  return evalObjectAt(state, "probe", time).value;
}

function loadState(filename: string): TheatreProjectState {
  const path = resolve(process.cwd(), "public/assets/3d/theatre", filename);
  return JSON.parse(readFileSync(path, "utf8")) as TheatreProjectState;
}

function getTrack(
  state: TheatreProjectState,
  objectKey: string,
  propertyPath: string
): Track {
  const sheet = Object.values(state.sheetsById)[0];
  const object = sheet.sequence.tracksByObject[objectKey];
  const entry = Object.entries(object.trackIdByPropPath).find(
    ([path]) => (JSON.parse(path) as string[]).join(".") === propertyPath
  );
  if (!entry) {
    throw new Error(`Missing track ${objectKey}.${propertyPath}`);
  }
  return object.trackData[entry[1]] as Track;
}

test("uses the left outgoing and right incoming handles and preserves endpoints", () => {
  const keyframes: Keyframe[] = [
    {
      position: 0,
      value: 10,
      handles: [0.05, 0.95, 0.2, 0.05],
    },
    {
      position: 1,
      value: 20,
      handles: [0.8, 0.9, 0.95, 0.05],
    },
  ];
  const state = makeState(keyframes);
  const track: Track = { type: "BasicKeyframedTrack", keyframes };

  expect(evaluatedValue(state, 0)).toBe(10);
  expect(evaluatedValue(state, 1)).toBe(20);

  for (const time of [0.1, 0.25, 0.5, 0.75, 0.9]) {
    expect(evaluatedValue(state, time)).toBeCloseTo(
      referenceTrackValue(track, time),
      12
    );
  }
});

test("falls back to binary search when the Newton derivative is too small", () => {
  const keyframes: Keyframe[] = [
    {
      position: 0,
      value: 0,
      handles: [0.25, 0.25, 0, 0],
    },
    {
      position: 1,
      value: 1,
      handles: [0, 1, 0.75, 0.75],
    },
  ];
  const state = makeState(keyframes);
  const track: Track = { type: "BasicKeyframedTrack", keyframes };
  const time = 0.0001;
  const actual = evaluatedValue(state, time);

  expect(actual).toBeCloseTo(referenceTrackValue(track, time), 12);
  expect(actual).toBeGreaterThan(0.001);
});

test("produces bounded monotonic samples for a monotonic authored curve", () => {
  const state = makeState([
    {
      position: 0,
      value: -2,
      handles: [0, 0, 0.42, 0],
    },
    {
      position: 1,
      value: 3,
      handles: [0.58, 1, 1, 1],
    },
  ]);

  const samples = Array.from({ length: 101 }, (_, index) =>
    evaluatedValue(state, index / 100)
  );
  expect(samples[0]).toBe(-2);
  expect(samples[samples.length - 1]).toBe(3);

  for (let index = 1; index < samples.length; index++) {
    expect(samples[index]).toBeGreaterThanOrEqual(samples[index - 1]);
    expect(samples[index]).toBeGreaterThanOrEqual(-2);
    expect(samples[index]).toBeLessThanOrEqual(3);
  }
});

test("matches representative captured tracks across multiple scenes", () => {
  const cases = [
    {
      filename: "HeroScene.theatre-project-state_15.json",
      objectKey: "camera",
      propertyPath: "position.x",
    },
    {
      filename:
        "SidekickScene.theatre-project-state_14_910d17ff-f5fb-4da0-920e-1b66f8d229b3.json",
      objectKey: "asset-1",
      propertyPath: "visibility",
    },
    {
      filename:
        "RetailScene.theatre-project-state-cs-251209v2_b28f3c6c-7ab6-4036-9ac4-9f48df3024f0.json",
      objectKey: "camera",
      propertyPath: "target.x",
    },
  ] as const;

  for (const entry of cases) {
    const state = loadState(entry.filename);
    const track = getTrack(state, entry.objectKey, entry.propertyPath);

    for (let index = 0; index < track.keyframes.length - 1; index++) {
      const left = track.keyframes[index];
      const right = track.keyframes[index + 1];
      for (const fraction of [0.2, 0.5, 0.8]) {
        const time =
          left.position + (right.position - left.position) * fraction;
        const actual =
          evalObjectAt(state, entry.objectKey, time)[entry.propertyPath];
        expect(actual).toBeCloseTo(referenceTrackValue(track, time), 12);
      }
    }
  }
});
