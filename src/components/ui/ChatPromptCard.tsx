export function ChatPromptCard({
  text,
  className = "",
  dark = false,
}: {
  text: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-4 shadow-card ${
        dark ? "bg-ink text-white" : "bg-white text-ink"
      } ${className}`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm">
        🤖
      </span>
      <p className="flex-1 text-sm leading-snug">{text}</p>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-white">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M6 10V2M6 2L2 6M6 2L10 6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
