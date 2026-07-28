import Image from "next/image";
import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { ImageRow } from "@/components/ui/ImageRow";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { PhoneFrame } from "@/components/ui/PhoneFrame";

export function ShopAppSection() {
  return (
    <CategorySectionShell
      id="shop-app"
      name="Shop app"
      tagline="Reach millions of high-intent shoppers with personalized buying experiences."
      sceneId="shop-app"
    >
      <Reveal>
        <ImageRow
          panels={[
            {
              title: "Dynamic storefronts",
              description:
                "Automatically personalize your Shop storefront with relevant products for each shopper.",
              media: (
                <PhoneFrame>
                  <div className="flex aspect-3/4 items-center justify-center bg-gradient-to-b from-slate-700 to-slate-900 text-sm font-semibold text-white">
                    New arrivals
                  </div>
                </PhoneFrame>
              ),
              ctaLabel: "Read article",
            },
            {
              title: "Deals feed",
              description:
                "Highlight discounts, price drops, and Shop Campaigns in the dedicated Deals feed in Shop.",
              media: (
                <PhoneFrame>
                  <div className="relative aspect-3/4">
                    <Image
                      src="/assets/content/U153_Offers_in_Shop.png"
                      alt="A section at the top of the Shop app shows exclusive offers."
                      fill
                      className="object-cover"
                      sizes="280px"
                    />
                  </div>
                </PhoneFrame>
              ),
              ctaLabel: "Read article",
            },
            {
              title: "Shoppable videos",
              description:
                "Add shoppable videos to Shop and AI will optimize their distribution with built-in ranking and recommendations.",
              media: (
                <PhoneFrame>
                  <div className="relative aspect-3/4">
                    <video
                      className="absolute inset-0 h-full w-full object-cover"
                      poster="/assets/content/def37b82d2b5486a87cbf297a896f7d4.thumbnail.0000000000.jpg"
                      controls
                      playsInline
                    >
                      <source src="/assets/video/shop-app-video.mp4" type="video/mp4" />
                    </video>
                  </div>
                </PhoneFrame>
              ),
              ctaLabel: "Read help doc",
            },
          ]}
        />
      </Reveal>

      <Reveal>
        <FeatureGrid
          items={[
            { title: "Customizable product pages", body: "Design your Shop product pages with custom sections, videos, and branding, then preview how they look before going live." },
            { title: "Better product discovery in Shop Minis", body: "Your products automatically appear in immersive experiences, such as virtual try-on and outfit tracking, for relevant shoppers." },
            { title: "Order tracking in 21 more countries", body: "Shoppers can track purchases in Germany, France, Italy, Spain, New Zealand, Mexico, Switzerland, Denmark, Belgium, Sweden, Norway, Poland, Romania, Portugal, Lithuania, the Czech Republic, the Netherlands, Austria, Finland, Estonia, and Latvia." },
          ]}
        />
      </Reveal>
    </CategorySectionShell>
  );
}
