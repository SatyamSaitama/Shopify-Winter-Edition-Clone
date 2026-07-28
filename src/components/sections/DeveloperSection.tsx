import Image from "next/image";
import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { GhostButton } from "@/components/ui/Button";
import { FeatureGrid } from "@/components/ui/FeatureGrid";

const devShowcase = [
  {
    title: "Admin Intents API",
    image: "/assets/content/U229_Admin_Intents_API.png",
    alt: "An interface where a user can add a product with a title, description, and media.",
  },
  {
    title: "Faster bulk data imports",
    image: "/assets/content/U191_Faster_bulk_data_imports.png",
    alt: "Multiple code editors where the developer is running a bulk import.",
  },
  {
    title: "Upgrades for metafields",
    image: "/assets/content/U223_upgrades_for_metafields.png",
    alt: "A code editor paired with a search bar where the user searched for a date.",
  },
  {
    title: "Tangle",
    image: "/assets/content/U267_Tangle.png",
    alt: "A visual editor where the user is training ML collaboratively.",
  },
  {
    title: "POS Extensions Storage API",
    image: "/assets/content/U190_pos_extension_storage_dark.png",
    alt: "A code editor shows the developer using the POS Extensions Storage API.",
  },
];

export function DeveloperSection() {
  return (
    <CategorySectionShell
      id="developer"
      name="Developer"
      tagline="A completely new way to build for commerce with the power of AI."
      sceneId="developer"
    >
      <Reveal className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <div className="relative aspect-4/3 overflow-hidden rounded-md shadow-card">
            <Image
              src="/assets/content/U271_Checkout_MCP.png"
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <p className="mt-4 text-sm font-semibold text-ink">
            Shopify Catalog for all
          </p>
          <p className="mt-1 text-sm text-slate">
            Search billions of products across Shopify merchants using MCP
            tools or REST — and soon, select partners can access a direct
            catalog feed.
          </p>
          <div className="mt-3">
            <GhostButton>Read dev docs</GhostButton>
          </div>
        </div>
        <div>
          <div className="relative aspect-4/3 overflow-hidden rounded-md shadow-card">
            <Image
              src="/assets/content/U183_Checkout_for_web_f222b0b3-24d2-4ee2-aff2-ebf8ffb4a766.png"
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <p className="mt-4 text-sm font-semibold text-ink">
            Checkout Kit for web
          </p>
          <p className="mt-1 text-sm text-slate">
            Bring a merchant&apos;s checkout to any agentic flow in a browser
            with a JS library that renders in a pop-up or a new tab — also
            available in Swift, Android, and React Native.
          </p>
          <div className="mt-3">
            <GhostButton>Read dev docs</GhostButton>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
          {devShowcase.map((d) => (
            <div key={d.title}>
              <div className="relative aspect-3/4 overflow-hidden rounded-md bg-[#14181f]">
                <Image src={d.image} alt={d.alt} fill className="object-cover" sizes="20vw" />
              </div>
              <p className="mt-2 text-xs font-medium text-ink">{d.title}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <FeatureGrid
          items={[
            { title: "Nested cart lines", body: "Build support for merchants to nest cart lines in cart, checkout, and post-purchase views for product add-ons, such as extended warranties." },
            { title: "Native wallet buttons before checkout", body: "Add Shop Pay and Apple Pay wallet buttons on PDP and Cart pages in mobile apps using the Checkout Kit." },
            { title: "Cart Transform Function API on POS", body: "Use this API to let POS dynamically expand, merge, or update cart lines for bundles, custom pricing, and rich cart customization." },
            { title: "Transfers API", body: "Model real-world transfers, including those from locations not tracked in Shopify, with the Transfers API." },
            { title: "Customer Account API supports third-party apps", body: "Use Shopify customer authentication to give customers a unified sign-in experience and securely access customer data." },
            { title: "ShopifyQL API for Shopify Analytics", body: "Build analytics features faster by querying thousands of combinations of Shopify Analytics metrics and dimensions." },
            { title: "Return APIs with payment reference", body: "Simplify reconciliation for returns through a direct reference to the transaction with the Return API." },
            { title: "Store credit refunds in returns API", body: "Refund to store credit through the return and order cancellation APIs, even when store credit was not the original payment method." },
            { title: "Returns processing API", body: "Control when return sales are recorded in Shopify using a new processing mutation." },
            { title: "Order review operation in Shopify Functions", body: "Determine which B2B orders require review based on specific conditions using the orderReviewAdd operation in payment customization. Exclusive to Plus." },
          ]}
        />
      </Reveal>
    </CategorySectionShell>
  );
}
