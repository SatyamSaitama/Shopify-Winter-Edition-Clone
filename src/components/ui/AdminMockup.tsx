import { GhostButton } from "./Button";

const NAV_ITEMS = [
  "Home",
  "Orders",
  "Products",
  "Customers",
  "Marketing",
  "Discounts",
  "Content",
  "Markets",
  "Finances",
  "Analytics",
];

interface SuggestionCard {
  gradient: string;
  title: string;
  body: string;
  ctaLabel: string;
}

export function AdminMockup({
  chatHistory,
  activeChat,
  card,
}: {
  chatHistory: string[];
  activeChat: string;
  card: SuggestionCard;
}) {
  return (
    <div className="overflow-hidden rounded-lg shadow-card">
      <div className="flex items-center gap-6 bg-ink px-4 py-2.5 text-white">
        <span className="text-sm font-semibold">admin</span>
        <div className="flex-1 rounded-sm bg-white/10 px-3 py-1 text-xs text-white/50">
          Search
        </div>
        <div className="flex items-center gap-3 text-xs text-white/60">
          <span>store</span>
        </div>
      </div>
      <div className="flex min-h-[420px] bg-white">
        <nav className="w-40 shrink-0 border-r border-ink/10 py-3">
          {NAV_ITEMS.map((item) => (
            <div
              key={item}
              className="px-4 py-1.5 text-xs text-ink/70 first:font-medium first:text-ink"
            >
              {item}
            </div>
          ))}
          <div className="mt-4 border-t border-ink/10 px-4 pt-3">
            <p className="mb-1.5 text-[11px] text-ink/40">
              Sidekick conversations
            </p>
            {chatHistory.map((item) => (
              <div
                key={item}
                className={`mb-1 truncate rounded-xs px-2 py-1 text-[11px] ${
                  item === activeChat
                    ? "border border-ink/15 bg-paper text-ink"
                    : "text-ink/50"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </nav>
        <div className="flex-1 p-6">
          <div
            className={`mb-4 flex aspect-video items-center justify-center rounded-md ${card.gradient}`}
          />
          <p className="text-sm font-semibold text-ink">{card.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate">{card.body}</p>
          <div className="mt-4 flex items-center gap-2 rounded-md bg-paper p-3">
            <GhostButton>{card.ctaLabel}</GhostButton>
          </div>
        </div>
      </div>
    </div>
  );
}
