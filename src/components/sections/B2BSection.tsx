import Image from "next/image";
import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { ImageRow } from "@/components/ui/ImageRow";
import { FeatureGrid } from "@/components/ui/FeatureGrid";

export function B2BSection() {
  return (
    <CategorySectionShell
      id="b2b"
      name="B2B"
      tagline="Take your wholesale business global, discover new retailers, and get paid in more ways."
      sceneId="b2b"
    >
      <Reveal>
        <ImageRow
          panels={[
            {
              title: "Shopify Collective available globally",
              description:
                "Source and sell other Shopify brands directly from the admin using Shopify Collective, now available in 35 additional countries.",
              media: (
                <Image
                  src="/assets/content/U71_Shopify_Collective_globally_available.png"
                  alt="Shoes from Japan, Germany, and England shown as options for Shopify Collective."
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "ACH payments for B2B",
              description:
                "Accept ACH bank payments at checkout with Shopify Payments, and charge saved accounts directly from the admin. Exclusive to Plus. US only.",
              media: (
                <Image
                  src="/assets/content/U75_b2b_ACH_payments.png"
                  alt="The option to pay by ACH by linking a bank account, shown below other payment options."
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
          ]}
        />
      </Reveal>

      <Reveal>
        <ImageRow
          panels={[
            {
              title: "Suppliers can discover retailers",
              description:
                "Discover and connect with new retail partners using the Shopify Collective retailer directory.",
              media: (
                <Image
                  src="/assets/content/786dd1f1b8096bb6116dcbf0fe12893a.png"
                  alt="A search bar shows a supplier looking for skateboards to sell."
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Payment requests per fulfillment",
              description:
                "Send a separate payment request for each shipment of a multi-shipment order. Exclusive to Plus.",
              media: (
                <Image
                  src="/assets/content/U79_Send_payment_requests_per_fulfillment.png"
                  alt="A hat, t-shirt, and skateboard paired with their payments."
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
          ]}
        />
      </Reveal>

      <Reveal>
        <FeatureGrid
          items={[
            { title: "Store credit for B2B", body: "Issue store credit to company locations from their location profile or when refunding orders." },
            { title: "Pickup in store for B2B", body: "Let B2B customers select pick up as a delivery option at checkout." },
            { title: "Dynamic payment terms and deposits", body: "Use third-party or custom apps powered by Shopify Functions to set dynamic payment terms and deposit requirements. Exclusive to Plus." },
            { title: "Create rules for order review", body: "Set dynamic rules to determine which orders need review based on conditions like order values and products, using apps powered by Shopify Functions." },
            { title: "New B2B-compatible apps", body: "Offer quote requests, custom buyer roles, shopping lists, and more using 11 apps compatible with B2B." },
            { title: "Instant product imports for retailers", body: "Create public price lists that let retailers import products into their stores without waiting for approval on Shopify Collective." },
            { title: "ERP systems integration", body: "Sync companies, orders, and payment terms to NetSuite, BrightPearl, Fulfil, Sage, or Acumatica using pre-built integrations by Patchworks, Fulfil, and Kensium." },
            { title: "Improved product import for retailers", body: "Publish imported products to all channels by default on Shopify Collective." },
            { title: "Shopify and EDI workflows connect", body: "Sync EDI purchase orders from Crstl and SPS Commerce directly with your admin as draft orders, using pre-built integrations." },
            { title: "Horizon themes work with B2B", body: "All Horizon themes support built-in volume pricing, quantity rules, and quick order lists." },
          ]}
        />
      </Reveal>
    </CategorySectionShell>
  );
}
