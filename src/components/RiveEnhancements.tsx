"use client";

import { useEffect } from "react";
import {
  decodeFont,
  decodeImage,
  Fit,
  Layout,
  Rive,
  RuntimeLoader,
} from "@rive-app/canvas";
import riveContent from "@/data/rive-content.json";

type RiveAsset = {
  url?: string;
  localUrl?: string | null;
  isFont?: boolean;
};

type RiveConfig = {
  index: number;
  productHandle: string | null;
  description: string;
  src: string;
  artboard: string | null;
  animations: string | string[] | null;
  stateMachines: string | string[] | null;
  viewModelName: string | null;
  interactive: boolean;
  playsOnHover: boolean;
  tracksMouseOver: boolean;
  pausePlayback: boolean;
  skipAspectRatio: boolean;
  input: Record<string, number | boolean> | null;
  textRunMap: Record<string, string>;
  assetsMap: Record<string, RiveAsset>;
};

type RuntimeAsset = {
  name: string;
  isFont: boolean;
  isImage: boolean;
  setFont(font: Awaited<ReturnType<typeof decodeFont>>): void;
  setRenderImage(image: Awaited<ReturnType<typeof decodeImage>>): void;
};

type MountedRive = {
  alive: boolean;
  canvas: HTMLCanvasElement;
  poster: HTMLElement | null;
  resizeObserver: ResizeObserver;
  rive: Rive;
  cleanupInteraction: () => void;
};

const configs = riveContent as unknown as RiveConfig[];

function normalizeAssetName(name: string) {
  return name
    .toLowerCase()
    .replace(" ", "-")
    .replace(".png", "")
    .replace(".webp", "")
    .replace(".jpg", "")
    .replace(".ttf", "")
    .replace(".woff", "")
    .replace(".woff2", "")
    .replace(".otf", "");
}

function chooseAssets(config: RiveConfig, isMobile: boolean) {
  if (!config.viewModelName) return config.assetsMap;
  const excludedVariant = isMobile ? "-desktop" : "-mobile";
  return Object.fromEntries(
    Object.entries(config.assetsMap).filter(
      ([name]) => !name.includes(excludedVariant)
    )
  );
}

function applyTextRuns(rive: Rive, textRunMap: Record<string, string>) {
  for (const [key, value] of Object.entries(textRunMap)) {
    if (!value) continue;
    try {
      if (!key.includes("/")) {
        rive.setTextRunValue(key, value);
        continue;
      }
      const [path, textName] = key.split("/");
      if (rive.activeArtboard === path) {
        rive.setTextRunValue(textName, value);
      } else {
        rive.setTextRunValueAtPath(textName, value, path);
      }
    } catch {
      // Some authored text paths only exist in the opposite breakpoint's
      // bound view model. The production player silently leaves those alone.
    }
  }
}

export function RiveEnhancements() {
  useEffect(() => {
    RuntimeLoader.setWasmUrl("/assets/rive-runtime/rive.wasm");
    RuntimeLoader.setWasmFallbackUrl(
      "/assets/rive-runtime/rive_fallback.wasm"
    );

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const containers = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-component-name="rive-container"]'
      )
    );
    const mounted = new Map<HTMLElement, MountedRive>();
    const mountTimers = new Map<HTMLElement, number>();

    const unmount = (container: HTMLElement) => {
      const timer = mountTimers.get(container);
      if (timer) window.clearTimeout(timer);
      mountTimers.delete(container);

      const record = mounted.get(container);
      if (!record) return;
      record.alive = false;
      record.cleanupInteraction();
      record.resizeObserver.disconnect();
      record.rive.cleanup();
      record.canvas.remove();
      if (record.poster) record.poster.style.removeProperty("visibility");
      container.removeAttribute("data-rive-ready");
      mounted.delete(container);
    };

    const mount = (container: HTMLElement, config: RiveConfig) => {
      if (mounted.has(container)) return;

      const articleHandle = container
        .closest<HTMLElement>('article[data-component-name="product"]')
        ?.dataset.componentExtraHandle;
      if (
        config.productHandle &&
        articleHandle &&
        config.productHandle !== articleHandle
      ) {
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.className = "captured-rive-canvas";
      canvas.setAttribute("aria-label", config.description);
      if (config.description) canvas.setAttribute("role", "img");
      Object.assign(canvas.style, {
        position: "absolute",
        inset: "0",
        zIndex: "1",
        display: "block",
        width: "100%",
        height: "100%",
        opacity: "0",
        transition: "opacity 300ms ease",
        pointerEvents: config.interactive ? "auto" : "none",
      });
      container.append(canvas);

      const poster = container.firstElementChild as HTMLElement | null;
      const selectedAssets = chooseAssets(config, isMobile);
      let alive = true;

      const assetLoader = (untypedAsset: unknown) => {
        const asset = untypedAsset as RuntimeAsset;
        const name = normalizeAssetName(asset.name);
        const entry = asset.isFont
          ? config.assetsMap[name]
          : selectedAssets[name];
        if (!entry?.localUrl) return false;

        void (async () => {
          const response = await fetch(entry.localUrl!);
          if (!response.ok) {
            throw new Error(`${response.status} ${entry.localUrl}`);
          }
          const bytes = new Uint8Array(await response.arrayBuffer());

          if (asset.isFont) {
            const font = await decodeFont(bytes);
            if (alive) asset.setFont(font);
            font.unref();
            return;
          }

          if (asset.isImage) {
            const image = await decodeImage(bytes);
            if (alive) asset.setRenderImage(image);
            image.unref();
          }
        })().catch(() => undefined);
        return true;
      };

      const setPlayback = (shouldPlay: boolean) => {
        if (config.pausePlayback || prefersReducedMotion) {
          rive.pause();
        } else if (shouldPlay) {
          rive.play();
        } else {
          rive.pause();
        }
      };

      const onMouseEnter = () => setPlayback(true);
      const onMouseLeave = () => {
        if (config.playsOnHover && !isMobile) setPlayback(false);
      };
      const cleanupInteraction = () => {
        container.removeEventListener("mouseenter", onMouseEnter);
        container.removeEventListener("mouseleave", onMouseLeave);
      };

      const rive = new Rive({
        canvas,
        src: config.src,
        artboard: config.artboard ?? undefined,
        animations: config.animations ?? undefined,
        stateMachines: config.stateMachines ?? undefined,
        autoplay: false,
        autoBind: Boolean(config.viewModelName),
        useOffscreenRenderer: true,
        isTouchScrollEnabled: isMobile,
        layout: config.skipAspectRatio
          ? new Layout({ fit: Fit.Cover })
          : undefined,
        assetLoader,
        onLoad: () => {
          if (!alive) return;

          if (config.viewModelName) {
            const viewModel = rive.viewModelByName(config.viewModelName);
            const instanceName = isMobile ? "mobile" : "desktop";
            const instance = viewModel?.instanceNames.includes(instanceName)
              ? viewModel.instanceByName(instanceName)
              : viewModel?.defaultInstance();
            if (instance) rive.bindViewModelInstance(instance);
          }

          applyTextRuns(rive, config.textRunMap);
          if (
            typeof config.stateMachines === "string" &&
            !rive.stateMachineNames.includes(config.stateMachines) &&
            rive.stateMachineNames.length > 0
          ) {
            rive.reset({
              stateMachines: rive.stateMachineNames[0],
              artboard: config.artboard ?? undefined,
            });
            applyTextRuns(rive, config.textRunMap);
          }

          rive.resizeDrawingSurfaceToCanvas();
          if (poster) poster.style.visibility = "hidden";
          canvas.style.opacity = "1";
          container.dataset.riveReady = "true";
          setPlayback(!(config.playsOnHover && !isMobile));
        },
      });

      const resizeObserver = new ResizeObserver(() => {
        if (alive) rive.resizeDrawingSurfaceToCanvas();
      });
      resizeObserver.observe(container);

      if (config.playsOnHover && !isMobile) {
        container.addEventListener("mouseenter", onMouseEnter);
        container.addEventListener("mouseleave", onMouseLeave);
      }

      const record: MountedRive = {
        alive,
        canvas,
        poster,
        resizeObserver,
        rive,
        cleanupInteraction,
      };
      mounted.set(container, record);

      // Keep the closure and the externally mutable record in agreement.
      Object.defineProperty(record, "alive", {
        get: () => alive,
        set: (value: boolean) => {
          alive = value;
        },
        configurable: true,
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const container = entry.target as HTMLElement;
          const index = containers.indexOf(container);
          const config = configs[index];
          if (!config) continue;

          if (!entry.isIntersecting) {
            unmount(container);
            continue;
          }

          if (mounted.has(container) || mountTimers.has(container)) continue;
          const timer = window.setTimeout(
            () => {
              mountTimers.delete(container);
              if (container.isConnected) mount(container, config);
            },
            isMobile ? 600 : 300
          );
          mountTimers.set(container, timer);
        }
      },
      { rootMargin: "100% 100% 100% 100%" }
    );

    containers.forEach((container) => observer.observe(container));

    return () => {
      observer.disconnect();
      containers.forEach(unmount);
    };
  }, []);

  return null;
}
