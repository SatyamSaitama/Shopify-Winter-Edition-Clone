import Image from "next/image";
import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { GhostButton } from "@/components/ui/Button";
import { ImageRow } from "@/components/ui/ImageRow";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { FeatureGrid } from "@/components/ui/FeatureGrid";

export function MarketingSection() {
  return (
    <CategorySectionShell
      id="marketing"
      name="Marketing"
      tagline="Grow your sales with a first-of-its-kind product network."
      sceneId="marketing"
    >
      <Reveal>
        <h3 className="text-2xl font-bold text-ink">Shopify Product Network</h3>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-slate">
          Fill merchandise gaps by choosing to instantly surface products from
          other Shopify brands in your search, collections, emails, and
          post-purchase pages, and earn a commission on every sale. US only.
        </p>
        <div className="mt-4">
          <GhostButton>Get app</GhostButton>
        </div>
        <div className="mt-8 max-w-2xl">
          <BrowserFrame url="mvse.myshopify.com">
            <div className="flex aspect-video items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 text-2xl font-bold text-white">
              PUSHING BOUNDARIES
            </div>
          </BrowserFrame>
        </div>
      </Reveal>

      <Reveal>
        <ImageRow
          panels={[
            {
              title: "Shop Campaigns expands to the online store",
              description:
                "Automatically get promoted on collections, search, and post-purchase pages on other relevant Shopify stores. US only.",
              media: (
                <Image
                  src="/assets/content/228361bfc05b3d2c5260a542aa8c61c6.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Shopify Messaging supports SMS marketing",
              description:
                "Create, schedule, send, and track SMS marketing campaigns in the Shopify Messaging app.",
              media: (
                <Image
                  src="/assets/content/U105_Shopify_Email_SMS_marketing.png"
                  alt="An interface for selecting SMS recipients and message content, next to a phone showing the SMS."
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ),
            },
          ]}
        />
      </Reveal>

      <Reveal>
        <ImageRow
          panels={[
            {
              title: "Auto-translation for Shopify Forms",
              description:
                "Automatically translate forms from English into 19 other languages with the Shopify Forms app.",
              media: (
                <Image
                  src="/assets/content/U109_Forms_translations.png"
                  alt="A Shopify Form being translated from English to French, with a preview of the French version."
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Improved segmentation template search",
              description:
                "Browse, search, and filter through a refreshed customer segmentation template library.",
              media: (
                <Image
                  src="/assets/content/U98_Search_and_filter_segmentation_templates.png"
                  alt="A search window where the user searched for 'win back' with multiple template options shown."
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
            { title: "Target all audiences in one Shop Campaign", body: "Launch a single Shop Campaign for all audiences rather than choosing between acquisition or win back. US and Canada only." },
            { title: "Shop Campaigns on more channels", body: "Get promoted in new ad channels, including X, Snapchat, and Bing, and only pay when customers convert. US only." },
            { title: "Segment customers with product categories", body: "Create customer segments based on product categories that they have viewed or purchased." },
            { title: "Improved email customer segmentation", body: "Strategically target customers with intuitive segment selection and recommendations in the Shopify Messaging app." },
            { title: "Dynamic product sections", body: "Automatically display your best-selling or most relevant products in email campaigns." },
            { title: "Calendar view for campaigns", body: "Schedule marketing emails and SMS in the Shopify Messaging app calendar view." },
          ]}
        />
      </Reveal>
    </CategorySectionShell>
  );
}
