import Image from "next/image";
import { CategorySectionShell } from "./CategorySectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { GhostButton } from "@/components/ui/Button";
import { ImageRow } from "@/components/ui/ImageRow";
import { FeatureGrid } from "@/components/ui/FeatureGrid";

export function OnlineSection() {
  return (
    <CategorySectionShell
      id="online"
      name="Online"
      tagline="Validate store changes with A/B testing and an AI tool that simulates shopping behavior."
      sceneId="online"
    >
      <Reveal className="max-w-xl">
        <h3 className="text-2xl font-bold text-ink">
          Test and time your launches with Rollouts
        </h3>
        <p className="mt-3 text-base leading-relaxed text-slate">
          Schedule theme changes and A/B test with Rollouts, built directly
          into the admin.
        </p>
        <div className="mt-4">
          <GhostButton>Read help doc</GhostButton>
        </div>
      </Reveal>

      <Reveal className="max-w-xl">
        <h3 className="text-2xl font-bold text-ink">Shopify SimGym app</h3>
        <p className="mt-3 text-base leading-relaxed text-slate">
          Simulate shopper behavior with AI agents that use data from billions
          of purchases, and get actionable recommendations before going live.
        </p>
        <div className="mt-4">
          <GhostButton>Get app</GhostButton>
        </div>
      </Reveal>

      <Reveal>
        <ImageRow
          panels={[
            {
              title: "Manage store details in the theme editor",
              description:
                "Make changes to products, collections, markets, metafields, and more, all without leaving your workflow in the theme editor and across the admin.",
              media: (
                <Image
                  src="/assets/content/U37_Integrated_theme_editor.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Theme generation on mobile",
              description:
                "Design your store right from the Shopify mobile app by generating a theme, previewing it, and publishing on the go.",
              media: (
                <Image
                  src="/assets/content/U47_Theme_index_on_mobile.png"
                  alt="On a mobile phone, the prompt has been filled in with 'quality skateboard gear,' ready to hit Generate themes."
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              ),
              ctaLabel: "Read help doc",
            },
            {
              title: "Sell on WordPress",
              description:
                "Turn your WordPress site into an online store by adding products, collections, a cart, and checkout with the Shopify plugin.",
              media: (
                <Image
                  src="/assets/content/U230_Wordpress.png"
                  alt="A WordPress editor open with products being added to the site."
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
            { title: "Over 250 Horizon theme improvements", body: "Get new animations, interactive sections, faster performance, and more when using Horizon." },
            { title: "2048 variants per product", body: "Create products with up to 2048 variants to manage and merchandise more diverse catalogs." },
            { title: "Unlisted product status", body: "Hide products from search results, collections, and more, while keeping them accessible with a direct URL." },
            { title: "Collections improvements", body: "Duplicate collections and exclude products from smart collections using conditional logic." },
            { title: "Automatic discounts for eligible customers", body: "Run targeted promotions by creating automatic discounts that target specific customers, such as VIPs." },
            { title: "Compare-at prices in catalogs", body: "Set up compare-at prices directly in your admin without CSV imports or APIs." },
            { title: "Combine bundle options", body: "Combine options, such as size and length, in the Shopify Bundles app." },
            { title: "Unit pricing for all", body: "Display prices by weight, volume, length, or quantity in metric, imperial, or counts, now available globally." },
            { title: "Vibe code with Lovable", body: "Spin up a Shopify store using Lovable that includes products, inventory, analytics, checkout, and more." },
            { title: "AI-powered domain discovery", body: "Get suggestions for unique and available domain names from AI. English only." },
            { title: "Improved theme discovery", body: "Find a theme with improved search, more precise industry filters, and templates with less manual setup." },
            { title: "AI-generated theme before signup", body: "Describe what you want to sell and AI will generate a custom store, even without a Shopify account." },
            { title: "Autofill passcode on iOS 26", body: "Customers can sign into their account without leaving the browser using Apple's iOS 26 passcode autofill." },
            { title: "Faster customer login with Shop", body: "Let recognized Shop users sign in to any Shopify store with one tap." },
          ]}
        />
      </Reveal>

      <Reveal>
        <div className="overflow-hidden rounded-lg bg-ink">
          <div className="relative aspect-video">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              poster="/assets/content/5aa1f17e22044052af94fde4bb1d052c.thumbnail.0000000000.jpg"
              controls
              playsInline
            >
              <source src="/assets/video/tinker-demo.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="px-8 py-10 text-center">
            <h3 className="text-3xl font-bold text-paper">Introducing Tinker</h3>
            <p className="mx-auto mt-3 max-w-md text-base text-white/70">
              An app where entrepreneurs can play with the latest AI tools in
              a single place.
            </p>
            <div className="mt-5 flex justify-center">
              <GhostButton>Get app</GhostButton>
            </div>
          </div>
        </div>
      </Reveal>
    </CategorySectionShell>
  );
}
