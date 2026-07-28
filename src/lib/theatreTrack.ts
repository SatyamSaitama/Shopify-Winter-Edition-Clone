interface Keyframe {
  position: number;
  value: number;
  handles: [number, number, number, number];
}

interface BasicKeyframedTrack {
  type: "BasicKeyframedTrack";
  keyframes: Keyframe[];
}

interface TheatreSheet {
  staticOverrides?: { byObject?: Record<string, Record<string, unknown>> };
  sequence: {
    length: number;
    tracksByObject: Record<
      string,
      {
        trackIdByPropPath: Record<string, string>;
        trackData: Record<string, BasicKeyframedTrack>;
      }
    >;
  };
}

export interface TheatreProjectState {
  sheetsById: Record<string, TheatreSheet>;
}

function flattenNumericValues(
  value: unknown,
  prefix = "",
  result: Record<string, number> = {}
): Record<string, number> {
  if (typeof value === "number") {
    result[prefix] = value;
    return result;
  }
  if (typeof value === "boolean") {
    result[prefix] = value ? 1 : 0;
    return result;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;

  for (const [key, child] of Object.entries(value)) {
    flattenNumericValues(child, prefix ? `${prefix}.${key}` : key, result);
  }
  return result;
}

// Cubic bezier evaluation, matching the [x1,y1,x2,y2] easing-handle
// convention Theatre.js stores per keyframe segment.
function cubicBezier(t: number, x1: number, y1: number, x2: number, y2: number) {
  const epsilon = 1e-6;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = sampleX(u) - t;
    if (Math.abs(x) < epsilon) return sampleY(u);
    const dx = sampleDX(u);
    if (Math.abs(dx) < epsilon) break;
    u -= x / dx;
  }

  // Match the captured Theatre runtime: if Newton-Raphson cannot converge,
  // restart from the requested x value and bisect across the full unit range.
  let lower = 0;
  let upper = 1;
  u = t;
  if (u < lower) return sampleY(lower);
  if (u > upper) return sampleY(upper);

  while (lower < upper) {
    const x = sampleX(u);
    if (Math.abs(x - t) < epsilon) return sampleY(u);
    if (t > x) {
      lower = u;
    } else {
      upper = u;
    }
    u = (upper - lower) * 0.5 + lower;
  }
  return sampleY(u);
}

function evalTrack(track: BasicKeyframedTrack, time: number): number {
  const kfs = track.keyframes;
  if (kfs.length === 0) return 0;
  if (time <= kfs[0].position) return kfs[0].value;
  if (time >= kfs[kfs.length - 1].position) return kfs[kfs.length - 1].value;

  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i];
    const b = kfs[i + 1];
    if (time >= a.position && time <= b.position) {
      const span = b.position - a.position || 1;
      const t = (time - a.position) / span;
      // Theatre stores the outgoing handle on the current keyframe and the
      // incoming handle on the next keyframe. Using all four values from `a`
      // changes every authored segment curve.
      const [x1, y1] = [a.handles[2], a.handles[3]];
      const [x2, y2] = [b.handles[0], b.handles[1]];
      const eased = cubicBezier(t, x1, y1, x2, y2);
      return a.value + (b.value - a.value) * eased;
    }
  }
  return kfs[kfs.length - 1].value;
}

export function getSequenceLength(state: TheatreProjectState): number {
  const sheet = Object.values(state.sheetsById)[0];
  return sheet?.sequence.length ?? 1;
}

export function getStaticObjectValues(
  state: TheatreProjectState,
  objectKey: string
): Record<string, number> {
  const sheet = Object.values(state.sheetsById)[0];
  return flattenNumericValues(sheet?.staticOverrides?.byObject?.[objectKey]);
}

export function getStaticStringValue(
  state: TheatreProjectState,
  objectKey: string,
  propertyPath: string
): string | undefined {
  const sheet = Object.values(state.sheetsById)[0];
  let value: unknown = sheet?.staticOverrides?.byObject?.[objectKey];
  for (const segment of propertyPath.split(".")) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return undefined;
    }
    value = (value as Record<string, unknown>)[segment];
  }
  return typeof value === "string" ? value : undefined;
}

export function hasAnimatedTrack(
  state: TheatreProjectState,
  objectKey: string,
  propertyPath: string
): boolean {
  const sheet = Object.values(state.sheetsById)[0];
  const obj = sheet?.sequence.tracksByObject[objectKey];
  if (!obj) return false;

  for (const [propPathJson, trackId] of Object.entries(
    obj.trackIdByPropPath
  )) {
    const path: string[] = JSON.parse(propPathJson);
    if (path.join(".") !== propertyPath) continue;
    const keyframes = obj.trackData[trackId]?.keyframes ?? [];
    if (keyframes.length < 2) return false;
    return keyframes.some(
      (keyframe) => keyframe.value !== keyframes[0].value
    );
  }
  return false;
}

export function evalObjectAt(
  state: TheatreProjectState,
  objectKey: string,
  time: number
): Record<string, number> {
  const sheet = Object.values(state.sheetsById)[0];
  const obj = sheet?.sequence.tracksByObject[objectKey];
  const result = getStaticObjectValues(state, objectKey);
  if (!obj) return result;

  for (const [propPathJson, trackId] of Object.entries(obj.trackIdByPropPath)) {
    const track = obj.trackData[trackId];
    if (!track || track.type !== "BasicKeyframedTrack") continue;
    // Theatre can retain an empty track after a property has been reverted to
    // its static/default value. An empty track is not a numeric zero override.
    if (track.keyframes.length === 0) continue;
    const path: string[] = JSON.parse(propPathJson);
    const key = path.join(".");
    result[key] = evalTrack(track, time);
  }
  return result;
}
