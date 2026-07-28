export function TornEdge({
  fill,
  flip = false,
}: {
  fill: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      className={`block h-10 w-full ${flip ? "-scale-y-100" : ""}`}
      aria-hidden
    >
      <path
        d="M0 22 L60 14 L130 26 L210 10 L300 20 L380 6 L460 18 L540 4 L620 16 L700 8 L780 22 L860 12 L940 24 L1020 8 L1100 18 L1180 6 L1260 20 L1340 10 L1440 18 L1440 40 L0 40 Z"
        fill={fill}
      />
    </svg>
  );
}
