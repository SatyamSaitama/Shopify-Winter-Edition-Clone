import Image from "next/image";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionTitle, FeatureCopy } from "@/components/ui/FeatureCopy";
import { Reveal } from "@/components/ui/Reveal";
import { RealScene } from "@/components/ui/RealScene";
import { ChatPromptCard } from "@/components/ui/ChatPromptCard";
import { PromptCloud } from "@/components/ui/PromptCloud";
import { DotCanvas } from "@/components/ui/DotCanvas";
import { ImageDuo } from "@/components/ui/ImageDuo";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { TornEdge } from "@/components/ui/TornEdge";
import { GhostButton } from "@/components/ui/Button";

const appIdeaCloud = [
  { text: "Create an app that checks returns and cancellation eligibility for orders.", top: "4%", left: "48%", size: "sm" as const, muted: true },
  { text: "Create an event page with time-limited discounted checkout links for selected products.", top: "0%", left: "72%", size: "sm" as const, muted: true },
  { text: "Create an app that recommends which products I need to reorder.", top: "22%", left: "26%", size: "sm" as const, muted: true },
];

const promptWordCloud = [
  { text: "/seo-optimization", top: "0%", left: "34%", size: "md" as const, muted: true },
  { text: "/monthly-snapshot", top: "8%", left: "70%", size: "sm" as const, muted: true },
  { text: "/editions", top: "18%", left: "30%", size: "sm" as const, muted: true },
  { text: "/retention-check", top: "18%", left: "52%", size: "md" as const, muted: true },
  { text: "/promo-setup", top: "28%", left: "22%", size: "sm" as const, muted: true },
  { text: "/win-back", top: "26%", left: "65%", size: "sm" as const, muted: true },
  { text: "/brand-image", top: "38%", left: "38%", size: "lg" as const },
  { text: "/email-campaign", top: "38%", left: "76%", size: "sm" as const, muted: true },
  { text: "/inventory-check", top: "40%", left: "0%", size: "sm" as const, muted: true },
  { text: "/marketing-mix", top: "52%", left: "26%", size: "sm" as const, muted: true },
  { text: "/product-deep-dive", top: "50%", left: "50%", size: "md" as const },
  { text: "/checkout-drops", top: "52%", left: "72%", size: "sm" as const, muted: true },
  { text: "/bundle-finder", top: "62%", left: "16%", size: "sm" as const, muted: true },
  { text: "/discount-strategy", top: "62%", left: "36%", size: "lg" as const },
  { text: "/build-collections", top: "62%", left: "66%", size: "sm" as const, muted: true },
  { text: "/social-posts", top: "72%", left: "20%", size: "sm" as const, muted: true },
  { text: "/return-patterns", top: "72%", left: "44%", size: "md" as const },
  { text: "/new-buyer", top: "70%", left: "80%", size: "sm" as const, muted: true },
  { text: "/gift-guide", top: "82%", left: "30%", size: "sm" as const, muted: true },
  { text: "/go-global", top: "82%", left: "58%", size: "sm" as const, muted: true },
];

export function SidekickSection() {
  return (
    <section id="sidekick" className="relative">
      {/* Act 1 — dark, starry backdrop */}
      <div className="relative">
        <div className="sticky top-0 h-svh -mb-svh">
          <RealScene
            sceneId="sidekick"
            scrollTarget="#sidekick"
          />
        </div>
        <SectionContainer className="relative flex min-h-[70svh] flex-col justify-end py-0 md:min-h-[140svh] md:justify-center">
          <Reveal className="flex flex-col md:grow">
            <h2 className="flex flex-col justify-center py-[40px] font-sans text-display-lg font-bold text-paper drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] md:py-[130px] glg:pt-[11vh]">
              Sidekick
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mb-[70px] max-w-2xl lg:mb-10 lg:w-9/12">
            <p className="font-serif text-3xl leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-4xl">
              <span className="font-script text-6xl leading-none">T</span>he
              AI-powered Shopify expert who&apos;s just as obsessed with your
              business as you are.
            </p>
          </Reveal>
        </SectionContainer>
      </div>
      <TornEdge fill="#f7f7ee" />

      {/* Act 2 — parchment content */}
      <div className="relative z-10 bg-paper py-24">
        <SectionContainer className="space-y-32">
          <Reveal className="max-w-xl">
            <div className="group relative flex aspect-video items-center justify-center overflow-hidden bg-[#1a2033]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                poster="/assets/content/620a0d8735da4d97b040b1cd98693898.thumbnail.0000000000.jpg"
                controls
                playsInline
              >
                <source src="/assets/video/sidekick-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </Reveal>

          <Reveal>
            <SectionTitle text="Insights, proactively delivered" />
            <div className="mt-8">
              <FeatureCopy
                eyebrow="Smart suggestions"
                heading="Sidekick Pulse delivers personalized recommendations and next steps for your business using market trends and data from your store."
              />
            </div>
            <div className="relative mt-10 aspect-video max-w-2xl overflow-hidden rounded-lg shadow-card">
              <Image
                src="/assets/content/compressed-pulseDesktopPoster-desktop.webp"
                alt="Sidekick Pulse admin panel with a proactive recommendation card"
                fill
                className="object-cover"
                sizes="(min-width: 640px) 672px, 100vw"
              />
            </div>
          </Reveal>

          <Reveal>
            <SectionTitle text="Complexity, delegated" />
            <div className="mt-8">
              <FeatureCopy
                eyebrow="Custom app generation"
                heading="Get Sidekick to build custom apps designed specifically for your business needs."
              />
            </div>
            <div className="relative mt-6 overflow-hidden rounded-lg">
              <Image
                src="/assets/content/apps-bg-image.png"
                alt=""
                width={1200}
                height={521}
                className="w-full opacity-60"
              />
              <PromptCloud items={appIdeaCloud} className="absolute inset-0 h-full" />
              <ChatPromptCard
                text="Create a bulk B2B company importer that uploads companies from a CSV file."
                className="absolute bottom-6 left-1/2 max-w-md -translate-x-1/2"
              />
            </div>
          </Reveal>

          <Reveal>
            <FeatureCopy
              eyebrow="Workflow automations"
              heading="Describe the workflow you want to automate, and Sidekick will build it in the Shopify Flow app."
              ctaLabel="Get app"
            />
            <div className="mt-8 flex justify-end">
              <DotCanvas>
                <ChatPromptCard
                  text="Create a workflow to email me when inventory for any variant drops below 5 for the first time."
                  className="w-[85%]"
                />
              </DotCanvas>
            </div>
          </Reveal>

          <Reveal>
            <ImageDuo
              left={{
                title: "Custom analytics reports",
                description:
                  "Sidekick can generate custom reports and data visualizations directly in the ShopifyQL query editor.",
                bg: "bg-[#2a2515]",
                image: "/assets/content/default_ee658e76-0d9b-46c9-b479-5baab424fb97.png",
                prompt: "Show me high value products in the past three months",
              }}
              right={{
                title: "Segmentation support",
                description:
                  "Sidekick can help you build segments or generate them from scratch.",
                bg: "bg-[#4c5a44]",
                image: "/assets/content/en_3a493a1f-2575-43b6-9e6e-22033556b139.png",
                prompt: "Show customers subscribed to marketing with no purchases",
              }}
            />
          </Reveal>

          <Reveal>
            <SectionTitle text="Designs, refined" />
            <div className="mt-8">
              <FeatureCopy
                eyebrow="Generate theme edits"
                heading="Tell Sidekick the specific design updates you want and watch it adjust your theme instantly."
              />
            </div>
            <div className="relative mt-10 aspect-video max-w-2xl overflow-hidden rounded-md shadow-card">
              <Image
                src="/assets/content/u16poster_desktop.webp"
                alt="Theme editor showing a store redesign in progress"
                fill
                className="object-cover"
                sizes="(min-width: 640px) 672px, 100vw"
              />
            </div>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                {
                  title: "Studio-quality photos",
                  description:
                    "Prompt Sidekick to change image backgrounds, add or remove elements, and expand canvas size.",
                  image: "/assets/content/en_a158fbbf-7e97-4014-9008-9eb7a719f84a.png",
                },
                {
                  title: "Mobile image editor",
                  description:
                    "Turn any image into a highly polished product shot with Sidekick using the Shopify mobile app file editor.",
                  image: "/assets/content/default_be7aaa86-31c5-433d-aae2-5b361372ccc6.png",
                },
                {
                  title: "Email editing",
                  description:
                    "Sidekick can help you edit emails in the Shopify Messaging app email editor.",
                  image: null,
                },
              ].map((p) => (
                <div key={p.title}>
                  <div className="relative aspect-4/3 overflow-hidden rounded-md bg-[#3a1f33]">
                    {p.image && (
                      <Image src={p.image} alt="" fill className="object-cover" sizes="33vw" />
                    )}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">{p.title}</p>
                  <p className="mt-1 text-sm text-slate">{p.description}</p>
                  <div className="mt-3">
                    <GhostButton>Read help doc</GhostButton>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <SectionTitle text="Tedious tasks, simplified" />
            <div className="mt-8">
              <FeatureCopy
                eyebrow="Shortcuts for prompts"
                heading="Turn your Sidekick prompts into reusable Skills, then share your favorites with the community and discover new ones to try."
              />
            </div>
            <PromptCloud items={promptWordCloud} className="mt-4" />
          </Reveal>

          <Reveal>
            <ImageDuo
              left={{
                title: "Multi-step task completion",
                description:
                  "Partner with Sidekick on more complex tasks now that it can plan, write to-do lists, and take on multiple actions.",
                bg: "bg-[#5c4a2a]",
                prompt: "Create a bestsellers collection with a discount",
              }}
              right={{
                title: "Voice-powered mobile chat",
                description: "Speak with Sidekick on the go, right in the Shopify mobile app.",
                bg: "bg-[#3f2f42]",
              }}
            />
          </Reveal>

          <Reveal>
            <FeatureGrid
              items={[
                { title: "Wide-mode", body: "Sidekick goes full screen so you can tackle complex tasks with more room to work." },
                { title: "App discovery", body: "Sidekick can help you find, compare, and install apps." },
                { title: "Target selection", body: "Sidekick gives contextual answers when clicking on specific areas of the admin." },
                { title: "Better memory", body: "Sidekick remembers your chats and unique user preferences." },
                { title: "Quick company creation", body: "Sidekick can easily create B2B companies." },
                { title: "Money management", body: "Sidekick checks your Shopify Balance and can make transfers with your approval." },
              ]}
            />
          </Reveal>
        </SectionContainer>
      </div>
      <TornEdge fill="#171512" />
    </section>
  );
}
