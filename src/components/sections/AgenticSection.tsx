import Image from "next/image";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Reveal } from "@/components/ui/Reveal";
import { RealScene } from "@/components/ui/RealScene";
import { GhostButton } from "@/components/ui/Button";

function ChatDemo() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 shadow-card">
      <Image
        src="/assets/content/chatgptdesktopposter_12_10.webp"
        alt="A ChatGPT conversation recommending skateboard products with buy buttons"
        fill
        className="object-cover"
        sizes="(min-width: 640px) 420px, 100vw"
      />
    </div>
  );
}

export function AgenticSection() {
  return (
    <section id="agentic" className="relative">
      <div className="relative">
        <div className="sticky top-0 h-svh -mb-svh">
          <RealScene
            sceneId="agentic"
            scrollTarget="#agentic"
          />
        </div>
        <SectionContainer className="relative flex min-h-[70svh] flex-col justify-end py-0 md:min-h-[140svh] md:justify-center glg:block glg:place-content-center">
          <Reveal className="flex flex-col md:grow">
            <h2 className="flex flex-col justify-center py-[40px] font-sans text-display-lg font-bold text-paper drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] md:py-[130px] glg:pt-[14vh] glg:pb-0">
              Agentic
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mb-[70px] max-w-2xl lg:mb-10 lg:w-9/12 glg:pt-[11vh]">
            <p className="font-serif text-3xl leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-4xl">
              <span className="font-script text-6xl leading-none">S</span>ell
              directly in AI chats with built-in tools that syndicate your
              products to every AI platform.
            </p>
          </Reveal>
        </SectionContainer>
      </div>

      <SectionContainer className="relative space-y-32 pb-40">
        <Reveal delay={0.1} className="grid grid-cols-1 items-center gap-12 glg:grid-cols-2">
          <ChatDemo />
          <div>
            <h3 className="text-2xl font-bold text-white">
              Shopify Agentic Storefronts
            </h3>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/70">
              Manage how your brand appears to the millions of users shopping
              in AI chats. Your products are discoverable right in ChatGPT,
              Copilot, and Perplexity, with other channels coming soon.
            </p>
            <div className="mt-4">
              <GhostButton>Read help doc</GhostButton>
            </div>
          </div>
        </Reveal>

        <Reveal className="text-center">
          <p className="mx-auto max-w-lg text-sm text-white/50">
            Set up your data once and Shopify Agentic Storefronts will
            surface your products to AI chats everywhere.
          </p>
        </Reveal>
      </SectionContainer>
    </section>
  );
}
