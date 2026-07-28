import Image from "next/image";
import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { ImageRow } from "@/components/ui/ImageRow";
import { FeatureGrid } from "@/components/ui/FeatureGrid";

export function ShippingSection() {
  return (
    <CategorySectionShell
      id="shipping"
      name="Shipping"
      tagline="Ship confidently and cheetah-fast with more label, partner, and carrier options."
      sceneId="shipping"
    >
      <Reveal>
        <ImageRow
          panels={[
            {
              title: "FedEx return labels",
              description:
                "Create, send, and track FedEx return labels in the Shopify admin with discounted pay-on-scan rates. US only.",
              media: (
                <Image
                  src="/assets/content/U117_FedEx_One_Rate_Return_Labels_6-col.png"
                  alt="A FedEx return label paired with the shipping interface showing the creation of a return label."
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Default package per variant",
              description:
                "Set a default package for each variant to get more accurate shipping rates at checkout and buy labels faster for single-item orders.",
              media: (
                <Image
                  src="/assets/content/U122_Variant_default_packaging.png"
                  alt="The shipping interface shows default packaging options for each product."
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
            { title: "Custom sender name on labels", body: "Choose the sender name that appears on your shipping labels to protect privacy, satisfy legal requirements, and keep gifts discreet." },
            { title: "More logistics partners", body: "Choose from more third-party fulfillment partners, including Amazon, Bigblue, DHL, GoBolt, and Mayple, and track performance in the Shopify Fulfillment Network." },
            { title: "Expanded US and Canada cross-border labels", body: "Buy DHL Express Delivered Duty Paid (DDP) or Delivered Duty Unpaid (DDU) and Canada Post DDP labels in Canada, and buy DHL eCommerce DDU labels in the US — directly in the admin." },
            { title: "More global shipping carriers", body: "Buy shipping labels directly in the admin for Royal Mail in the UK, Australia Post in Australia, and DHL Express in Canada." },
            { title: "In-progress fulfillment status", body: "Mark orders as in progress, add timeline notes, run bulk actions, and manage statuses in a redesigned fulfillment card." },
          ]}
        />
      </Reveal>
    </CategorySectionShell>
  );
}
