import { GhostButton } from "./Button";
import { DropCapHeading } from "./DropCapHeading";

export function SectionTitle({
  text,
  dark = false,
}: {
  text: string;
  dark?: boolean;
}) {
  return (
    <DropCapHeading
      text={text}
      className={dark ? "text-white" : "text-ink"}
    />
  );
}

export function FeatureCopy({
  eyebrow,
  heading,
  ctaLabel = "Read help doc",
  dark = false,
}: {
  eyebrow?: string;
  heading: string;
  ctaLabel?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-xl">
      {eyebrow && (
        <p
          className={`mb-2 text-sm font-semibold ${dark ? "text-white/70" : "text-ink"}`}
        >
          {eyebrow}
        </p>
      )}
      <p
        className={`font-serif text-2xl leading-tight sm:text-[28px] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {heading}
      </p>
      <div className="mt-4">
        <GhostButton>{ctaLabel}</GhostButton>
      </div>
    </div>
  );
}
