import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { ImageRow } from "@/components/ui/ImageRow";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import Image from "next/image";

export function OperationsSection() {
  return (
    <CategorySectionShell
      id="operations"
      name="Operations"
      tagline="Improve everyday workflows with flexible inventory modeling and trend-spotting analytics."
      sceneId="operations"
    >
      <Reveal>
        <ImageRow
          panels={[
            {
              title: "Flexible inventory transfers",
              description:
                "Split, edit, and manage inventory transfers with more flexibility across locations.",
              media: (
                <Image
                  src="/assets/content/U143_Flexible_inventory_transfers.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Faster quick sale on POS",
              description:
                "Tap the quick sale button, select products, and confirm a transaction in seconds.",
              media: (
                <Image
                  src="/assets/content/26605fc719dba38d9d2a5da83312810f.png"
                  alt="The quick sale button is tapped with three products selected, a checkout screen appears, and a receipt is shown."
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Apple Watch app redesign",
              description:
                "Check total sales and sessions at a glance from the redesigned Shopify Apple Watch app.",
              media: (
                <Image
                  src="/assets/content/U133_Apple_watch_app_redesign.png"
                  alt="An Apple Watch with the redesigned Shopify app showing total sales and total sessions."
                  fill
                  className="object-cover"
                  sizes="33vw"
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
            { title: "AI-enhanced chargeback management", body: "Auto-generate dispute summaries that include key factors like delivery tracking and your policies." },
            { title: "Password-free login", body: "Set up passkeys to access your store securely with your fingerprint, face, or PIN." },
            { title: "Heatmaps in analytics", body: "View data as a heatmap across two variables, such as sales by hour and day of the week to spot your highest selling time." },
            { title: "Customizable top items in analytics", body: "Get a flexible view of reports by configuring the number of items displayed in visualizations, no longer limited to five." },
            { title: "Bot filtering in analytics", body: "Exclude bot traffic for more accurate conversion rates and cleaner data." },
            { title: "Comprehensive inventory history", body: "Access full inventory adjustment history with the removal of the 180-day cap." },
            { title: "Precise date and time controls for analytics", body: "Monitor flash sales and product drops with filters that show data down to the minute." },
            { title: "Flash sales with multi-location inventory", body: "Run flash sales without overselling using inventory from multiple locations." },
            { title: "Single-view analytics for multiple stores", body: "See organization-wide performance in one view, then filter by store and compare metrics. Exclusive to Plus." },
            { title: "Bin locations in the Order Printer app", body: "Pick orders faster by assigning bin locations to each SKU using a CSV or the bulk editor in the Order Printer app." },
            { title: "More order filtering capabilities", body: "Filter orders by custom metafields, total value, and weight for smarter fulfillment workflows in admin." },
            { title: "Edit unfulfilled orders with duties", body: "Duties, taxes, and totals recalculate automatically when making changes to unfulfilled orders." },
            { title: "Smarter safeguards for inventory updates", body: "Prevent accidental overrides when you save bulk edits with color-coded changes, a warning, and a confirmation step." },
            { title: "Discounts on fulfilled items", body: "Issue refunds by applying discounts to fulfilled products for accurate taxes and reporting." },
            { title: "Preview workflow results in Flow", body: "Test workflows in the Shopify Flow app before going live and adjust logic without impacting real store data." },
            { title: "Redesigned Flow editor", body: "Build large automations in the Shopify Flow app with more workspace in the vertical layout." },
            { title: "Cancel workflow runs in Flow", body: "Stop automations by cancelling a run or multiple runs in the Shopify Flow app." },
            { title: "Store credit email notifications", body: "Notify customers when store credit has been issued with a customizable email." },
            { title: "Enhanced Managed Markets", body: "Sell internationally with instant compliance checks, faster payouts, and full Harmonized System code control. US only." },
          ]}
        />
      </Reveal>
    </CategorySectionShell>
  );
}
