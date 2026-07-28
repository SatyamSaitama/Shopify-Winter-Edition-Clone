export function DropCapHeading({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const first = text.charAt(0);
  const rest = text.slice(1);
  return (
    <h3
      className={`font-serif text-3xl leading-none text-ink sm:text-4xl ${className}`}
    >
      <span className="font-script text-6xl leading-none sm:text-7xl">
        {first}
      </span>
      {rest}
    </h3>
  );
}
