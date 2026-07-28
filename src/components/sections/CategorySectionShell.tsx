import type { ReactNode } from "react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Reveal } from "@/components/ui/Reveal";
import { RealScene } from "@/components/ui/RealScene";
import { TornEdge } from "@/components/ui/TornEdge";
import type { SceneId } from "@/data/scenes";

export function CategorySectionShell({
  id,
  name,
  tagline,
  sceneId,
  model,
  extraModels,
  backgroundModel,
  theatre,
  background,
  environment,
  overlay,
  children,
}: {
  id: string;
  name: string;
  tagline: string;
  sceneId?: SceneId;
  model?: string;
  extraModels?: string[];
  backgroundModel?: string;
  theatre?: string;
  background?: string;
  environment?: string;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  const layouts: Partial<
    Record<
      SceneId,
      { hero: string; title: string; description: string }
    >
  > = {
    online: {
      hero: "glg:block glg:place-content-center",
      title: "glg:pt-[14vh] glg:pb-0",
      description: "glg:pt-[11vh]",
    },
    retail: {
      hero: "glg:block glg:place-content-center",
      title: "glg:p-0",
      description: "glg:pt-[11vh]",
    },
    marketing: {
      hero: "glg:block glg:place-content-center",
      title: "glg:pb-0",
      description: "glg:pt-[11vh]",
    },
    checkout: {
      hero: "glg:block glg:place-content-end",
      title: "glg:mt-0 glg:mb-[11vh]",
      description: "glg:mt-[19vh]",
    },
    operations: {
      hero: "glg:block glg:place-content-end",
      title: "glg:mt-0 glg:mb-[11vh]",
      description: "glg:mt-[19vh]",
    },
    "shop-app": {
      hero: "glg:block glg:place-content-end",
      title: "glg:pt-0 glg:pb-[30vh]",
      description: "",
    },
    b2b: {
      hero: "",
      title: "glg:pt-[27vh]",
      description: "",
    },
    finance: {
      hero: "",
      title: "glg:pt-[35vh]",
      description: "",
    },
    shipping: {
      hero: "glg:block glg:place-content-end",
      title: "glg:pt-0 glg:pb-[30vh]",
      description: "",
    },
    developer: {
      hero: "glg:block glg:place-content-center",
      title: "glg:pt-[20vh] glg:pb-0",
      description: "glg:pt-[11vh]",
    },
  };
  const layout = sceneId ? layouts[sceneId] : undefined;
  const usesLightHeroText = sceneId === "developer";

  return (
    <section id={id} className="relative">
      <div className="relative">
        <div className="sticky top-0 h-svh -mb-svh">
          <RealScene
            sceneId={sceneId}
            model={model}
            extraModels={extraModels}
            backgroundModel={backgroundModel}
            theatre={theatre}
            background={background}
            environment={environment}
            scrollTarget={`#${id}`}
          />
          {overlay}
        </div>
        <SectionContainer
          className={`relative flex min-h-[70svh] flex-col justify-end py-0 md:min-h-[140svh] md:justify-center ${layout?.hero ?? ""}`}
        >
          <Reveal className="flex flex-col md:grow">
            <h2
              className={`flex flex-col justify-center py-[40px] font-sans text-display-lg font-bold transition-opacity duration-300 md:py-[130px] ${layout?.title ?? ""} ${
                usesLightHeroText
                  ? "text-ink"
                  : "text-paper drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]"
              }`}
            >
              {name}
            </h2>
          </Reveal>
          <Reveal
            delay={0.1}
            className={`mb-[70px] max-w-2xl lg:mb-10 lg:w-9/12 ${layout?.description ?? ""}`}
          >
            <p
              className={`font-serif text-3xl leading-tight sm:text-4xl ${
                usesLightHeroText
                  ? "text-ink"
                  : "text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
              }`}
            >
              <span className="font-script text-6xl leading-none">
                {tagline.charAt(0)}
              </span>
              {tagline.slice(1)}
            </p>
          </Reveal>
        </SectionContainer>
      </div>
      <TornEdge fill="#f7f7ee" />
      <div className="relative z-10 bg-paper py-24">
        <SectionContainer className="space-y-24">{children}</SectionContainer>
      </div>
    </section>
  );
}
