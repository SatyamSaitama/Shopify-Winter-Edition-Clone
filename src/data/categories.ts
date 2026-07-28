export interface CategoryMeta {
  id: string;
  numeral: string;
  name: string;
}

export const categories: CategoryMeta[] = [
  { id: "sidekick", numeral: "I", name: "Sidekick" },
  { id: "agentic", numeral: "II", name: "Agentic" },
  { id: "online", numeral: "III", name: "Online" },
  { id: "retail", numeral: "IV", name: "Retail" },
  { id: "marketing", numeral: "V", name: "Marketing" },
  { id: "checkout", numeral: "VI", name: "Checkout" },
  { id: "operations", numeral: "VII", name: "Operations" },
  { id: "shop-app", numeral: "VIII", name: "Shop app" },
  { id: "b2b", numeral: "IX", name: "B2B" },
  { id: "finance", numeral: "X", name: "Finance" },
  { id: "shipping", numeral: "XI", name: "Shipping" },
  { id: "developer", numeral: "XII", name: "Developer" },
];
