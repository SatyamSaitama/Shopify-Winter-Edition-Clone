"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { TexturePass } from "three/examples/jsm/postprocessing/TexturePass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { scenes, type SceneId } from "@/data/scenes";
import {
  SceneRuntime,
  loadSharedEnvironment,
} from "@/components/ui/sceneRuntime";
import {
  createCapturedNoiseTexture,
  crossfadeFragmentShader,
  fullscreenVertexShader,
  overlayFragmentShader,
} from "@/components/ui/sceneCompositorShaders";

const sceneIds = Object.keys(scenes) as SceneId[];

interface SceneMetric {
  id: SceneId;
  index: number;
  element: HTMLElement;
  top: number;
  height: number;
  heroHeight: number;
  earlyCrossfade: number;
}

interface ScrollScenes {
  current: SceneMetric;
  currentProgress: number;
  next: SceneMetric | null;
  nextProgress: number;
  transitionProgress: number;
}

const clamp01 = (value: number) => THREE.MathUtils.clamp(value, 0, 1);

function createRenderTarget(width: number, height: number, depthBuffer: boolean) {
  return new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
    depthBuffer,
    stencilBuffer: false,
  });
}

function adaptivePixelRatio(width: number, height: number) {
  return Math.max(
    1,
    Math.min(
      window.devicePixelRatio,
      2,
      3840 / Math.max(1, width),
      3840 / Math.max(1, height)
    )
  );
}

function findChapterElement(id: SceneId) {
  return (
    document.getElementById(id) ??
    document.querySelector<HTMLElement>(
      `[data-section-id="${CSS.escape(id)}"]`
    )
  );
}

/**
 * Document-space top of the element's *layout* box.
 *
 * `getBoundingClientRect` reports the visually transformed box, and the
 * authored hero is composed with `translate-y-[-100%]`. Reading its visual rect
 * puts the chapter a full section above the document origin, so every scroll
 * position resolves one chapter late and the page opens on Sidekick.
 *
 * The offset chain is used rather than un-transforming the rect because
 * Tailwind v4 emits the standalone `translate` property, which never appears in
 * computed `transform`. Walking `offsetParent` is immune to `translate`,
 * `transform`, `scale` and `rotate` alike.
 */
function layoutTop(element: HTMLElement) {
  let node: HTMLElement | null = element;
  let top = 0;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

function measureScenes(): SceneMetric[] {
  return sceneIds.flatMap((id, index) => {
    const element = findChapterElement(id);
    if (!element) return [];
    const rect = element.getBoundingClientRect();
    const authoredHero =
      id === "hero"
        ? element
        : element.querySelector<HTMLElement>(
            ":scope > div > div:first-child"
          );
    return [
      {
        id,
        index,
        element,
        top: layoutTop(element),
        height: Math.max(1, element.offsetHeight || rect.height),
        heroHeight: Math.max(
          1,
          authoredHero?.offsetHeight ?? window.innerHeight * 1.4
        ),
        earlyCrossfade:
          "earlyCrossfade" in scenes[id]
            ? Number(scenes[id].earlyCrossfade ?? 0)
            : 0,
      },
    ];
  });
}

/**
 * A chapter's Theatre clock runs over its own document box: time 0 as its top
 * reaches the viewport top, the full sequence by its bottom. The one-viewport
 * (plus authored early-crossfade) lead belongs to the *shader* transition, not
 * to the clock — folding it into the clock starts every chapter mid-sequence.
 * On Operations that landed the camera at t≈3.2 of a 5.2s move, framing the
 * table instead of the figures.
 *
 * Using the same function for the incoming chapter also keeps its clock
 * continuous: it reads 0 while the chapter is still fading in and carries that
 * value forward unchanged when it becomes current, so nothing pops.
 */
function chapterProgress(metric: SceneMetric, scrollY: number) {
  // Normalized over the authored hero block, not the chapter's full document
  // box. Editorial length varies from 2192px to 8556px between chapters while
  // every authored hero is 1.4 viewports, so scrubbing against `height` would
  // run each chapter's sequence at a different speed.
  return clamp01((scrollY - metric.top) / metric.heroHeight);
}

function resolveScrollScenes(
  metrics: SceneMetric[],
  scrollY: number,
  viewportHeight: number
): ScrollScenes | null {
  if (metrics.length === 0) return null;
  // `metric.index` addresses `sceneIds` (it drives the runtime map), so the
  // neighbour has to be resolved by position within `metrics` — that array
  // skips chapters whose element is not in the DOM yet.
  const found = metrics.findIndex(
    (metric) => scrollY < metric.top + metric.height
  );
  const position = found === -1 ? metrics.length - 1 : found;
  const current = metrics[position];
  const currentProgress = chapterProgress(current, scrollY);

  const next = metrics[position + 1] ?? null;
  if (!next) {
    return {
      current,
      currentProgress,
      next: null,
      nextProgress: 0,
      transitionProgress: 0,
    };
  }
  // The crossfade window opens one viewport plus the authored early offset
  // ahead of the incoming chapter and is normalized over its authored hero,
  // not its entire editorial body.
  const nextEarly = next.earlyCrossfade * viewportHeight;
  const crossfadeLead = clamp01(
    (scrollY - (next.top - viewportHeight - nextEarly)) /
      (next.height + viewportHeight + nextEarly)
  );
  const transitionProgress =
    crossfadeLead > 0
      ? clamp01(
          (crossfadeLead * (next.height + viewportHeight)) / next.heroHeight
        )
      : 0;
  return {
    current,
    currentProgress,
    next: crossfadeLead > 0 ? next : null,
    nextProgress: chapterProgress(next, scrollY),
    transitionProgress,
  };
}

function createFullscreenScene(material: THREE.ShaderMaterial) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  camera.position.z = 1;
  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { scene, camera, geometry };
}

export function SceneCompositor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const initialWidth = Math.max(1, container.clientWidth);
    const initialHeight = Math.max(1, container.clientHeight);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.autoClear = true;
    renderer.setClearColor(0x000000, 1);

    let pixelRatio = adaptivePixelRatio(initialWidth, initialHeight);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(initialWidth, initialHeight, false);
    const drawingSize = renderer.getDrawingBufferSize(new THREE.Vector2());

    // These two targets are the source compositor's current/next pair.
    const currentTarget = createRenderTarget(
      drawingSize.x,
      drawingSize.y,
      true
    );
    const nextTarget = createRenderTarget(
      drawingSize.x,
      drawingSize.y,
      true
    );
    const crossfadeTarget = createRenderTarget(
      drawingSize.x,
      drawingSize.y,
      false
    );
    const overlayTarget = createRenderTarget(
      drawingSize.x,
      drawingSize.y,
      false
    );
    currentTarget.texture.name = "SceneCompositor.Current";
    nextTarget.texture.name = "SceneCompositor.Next";
    crossfadeTarget.texture.name = "SceneCompositor.Crossfade";
    overlayTarget.texture.name = "SceneCompositor.Overlay";

    const noiseTexture = createCapturedNoiseTexture();
    const mudTexture = new THREE.TextureLoader().load(
      "/assets/3d/textures/mud_normal.webp",
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
      },
      undefined,
      () => {
        container.dataset.sceneStatus = "mud-texture-error";
      }
    );
    mudTexture.wrapS = THREE.RepeatWrapping;
    mudTexture.wrapT = THREE.RepeatWrapping;

    const crossfadeMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
        tCurrent: { value: currentTarget.texture },
        tNext: { value: currentTarget.texture },
        tMudNormal: { value: mudTexture },
        tNoise: { value: noiseTexture },
        uProgress: { value: 0 },
        uAspect: { value: initialWidth / initialHeight },
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(initialWidth, initialHeight),
        },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uIsHero: { value: 0 },
        uIsFallback: { value: 0 },
        uProjectionView: { value: new THREE.Matrix4() },
        uFadeCenterPoint: { value: new THREE.Vector3() },
        uDarken: { value: 0 },
      },
      vertexShader: fullscreenVertexShader,
      fragmentShader: crossfadeFragmentShader,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const overlayMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
        tInput: { value: crossfadeTarget.texture },
        tMudNormal: { value: mudTexture },
        tNoise: { value: noiseTexture },
        uPosition: { value: -1 },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0.9, 0.9, 0.9) },
        uResolution: {
          value: new THREE.Vector2(initialWidth, initialHeight),
        },
      },
      vertexShader: fullscreenVertexShader,
      fragmentShader: overlayFragmentShader,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const crossfadeStage = createFullscreenScene(crossfadeMaterial);
    const overlayStage = createFullscreenScene(overlayMaterial);

    // Captured order: crossfade -> overlay -> bloom (half-resolution mip
    // chain) -> SMAA -> output transform.
    //
    // The output transform runs *before* bloom here. The source composes with
    // `postprocessing`, whose BloomEffect measures luminance against the
    // tone-mapped LDR frame. Running the same 0.9 threshold against this
    // pipeline's linear half-float buffer lets most of a bright scene past it,
    // and the additive result blows the settled Hero into a white haze.
    const texturePass = new TexturePass(overlayTarget.texture);
    texturePass.clear = true;
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(initialWidth, initialHeight),
      0,
      0.85,
      0.9
    );
    // BloomEffect composites with SCREEN; UnrealBloomPass defaults to an
    // additive copy, which keeps accumulating over already-white pixels and
    // turns the Hero's garments into solid blobs. These factors implement
    // src + dst - src*dst, which saturates at white instead.
    bloomPass.blendMaterial.blending = THREE.CustomBlending;
    bloomPass.blendMaterial.blendEquation = THREE.AddEquation;
    bloomPass.blendMaterial.blendSrc = THREE.OneMinusDstColorFactor;
    bloomPass.blendMaterial.blendDst = THREE.OneFactor;

    const smaaPass = new SMAAPass();
    const outputPass = new OutputPass();
    const composerTarget = createRenderTarget(
      drawingSize.x,
      drawingSize.y,
      false
    );
    const composer = new EffectComposer(renderer, composerTarget);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(initialWidth, initialHeight);
    composer.addPass(texturePass);
    composer.addPass(outputPass);
    composer.addPass(bloomPass);
    composer.addPass(smaaPass);

    const environment = loadSharedEnvironment(
      renderer,
      scenes.hero.environment
    );
    const runtimes = new Map<number, SceneRuntime>();
    let metrics = measureScenes();
    let metricsDirty = metrics.length !== sceneIds.length;
    let disposed = false;
    let frameHandle = 0;
    let lastFrameTime = performance.now();
    let elapsedSeconds = 0;
    let activeIndex = -1;
    let width = initialWidth;
    let height = initialHeight;
    let overlayPosition = -1;

    const cameraPointerTarget = { x: 0, y: 0 };
    const cameraPointer = { x: 0, y: 0 };
    const shaderPointerTarget = { x: 0.5, y: 0.5 };
    const shaderPointer = { x: 0.5, y: 0.5 };
    const projectionView = new THREE.Matrix4();

    canvas.dataset.webglRenderer = "single";
    canvas.dataset.renderTargetType = "HalfFloatType";
    container.dataset.sceneStatus = "loading";

    const createRuntime = (index: number) => {
      const id = sceneIds[index];
      if (!id || runtimes.has(index)) return;
      runtimes.set(
        index,
        new SceneRuntime({
          id,
          definition: scenes[id],
          renderer,
          environment,
          width,
          height,
          reducedMotion,
        })
      );
    };

    const reconcileWindow = (index: number) => {
      if (index === activeIndex && runtimes.size > 0) return;
      activeIndex = index;
      const desired = new Set<number>();
      for (
        let candidate = Math.max(0, index - 1);
        candidate <= Math.min(sceneIds.length - 1, index + 1);
        candidate += 1
      ) {
        desired.add(candidate);
        createRuntime(candidate);
      }
      for (const [runtimeIndex, runtime] of runtimes) {
        if (desired.has(runtimeIndex)) continue;
        runtime.dispose();
        runtimes.delete(runtimeIndex);
      }
      canvas.dataset.sceneWindow = [...desired]
        .map((runtimeIndex) => sceneIds[runtimeIndex])
        .join(",");
    };

    const onPointerMove = (event: PointerEvent) => {
      cameraPointerTarget.x = (event.clientX / Math.max(1, width) - 0.5) * 2;
      cameraPointerTarget.y =
        -(event.clientY / Math.max(1, height) - 0.5) * 2;
      shaderPointerTarget.x = event.clientX / Math.max(1, width);
      shaderPointerTarget.y = event.clientY / Math.max(1, height);
    };
    const onPointerLeave = () => {
      cameraPointerTarget.x = 0;
      cameraPointerTarget.y = 0;
      shaderPointerTarget.x = 0.5;
      shaderPointerTarget.y = 0.5;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    const markMetricsDirty = () => {
      metricsDirty = true;
    };
    window.addEventListener("resize", markMetricsDirty);
    window.addEventListener("load", markMetricsDirty);

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(1, container.clientWidth);
      const nextHeight = Math.max(1, container.clientHeight);
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      pixelRatio = adaptivePixelRatio(width, height);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      const nextDrawingSize = renderer.getDrawingBufferSize(
        new THREE.Vector2()
      );
      currentTarget.setSize(nextDrawingSize.x, nextDrawingSize.y);
      nextTarget.setSize(nextDrawingSize.x, nextDrawingSize.y);
      crossfadeTarget.setSize(nextDrawingSize.x, nextDrawingSize.y);
      overlayTarget.setSize(nextDrawingSize.x, nextDrawingSize.y);
      composer.setPixelRatio(pixelRatio);
      composer.setSize(width, height);
      crossfadeMaterial.uniforms.uAspect.value = width / height;
      crossfadeMaterial.uniforms.uResolution.value.set(width, height);
      overlayMaterial.uniforms.uResolution.value.set(width, height);
      for (const runtime of runtimes.values()) {
        runtime.setSize(width, height);
      }
      metricsDirty = true;
    });
    resizeObserver.observe(container);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      container.dataset.sceneStatus = "context-lost";
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const renderSceneTo = (
      runtime: SceneRuntime,
      target: THREE.WebGLRenderTarget
    ) => {
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(runtime.scene, runtime.camera);
    };

    const renderFrame = (timestamp: number) => {
      if (disposed) return;
      frameHandle = requestAnimationFrame(renderFrame);
      const delta = Math.min(
        0.05,
        Math.max(0, (timestamp - lastFrameTime) / 1000)
      );
      lastFrameTime = timestamp;
      if (document.hidden) return;
      elapsedSeconds += delta;

      if (metricsDirty) {
        metrics = measureScenes();
        metricsDirty = metrics.length !== sceneIds.length;
      }
      const resolved = resolveScrollScenes(
        metrics,
        window.scrollY,
        window.innerHeight
      );
      if (!resolved) return;

      reconcileWindow(resolved.current.index);
      const currentRuntime = runtimes.get(resolved.current.index);
      const nextRuntime = resolved.next
        ? runtimes.get(resolved.next.index)
        : null;
      if (!currentRuntime) return;

      cameraPointer.x +=
        (cameraPointerTarget.x - cameraPointer.x) * 0.1;
      cameraPointer.y +=
        (cameraPointerTarget.y - cameraPointer.y) * 0.1;
      shaderPointer.x +=
        (shaderPointerTarget.x - shaderPointer.x) * 0.15;
      shaderPointer.y +=
        (shaderPointerTarget.y - shaderPointer.y) * 0.15;

      currentRuntime.update(
        resolved.currentProgress,
        delta,
        elapsedSeconds,
        cameraPointer,
        timestamp,
        resolved.current.id === "hero"
          ? window.scrollY / Math.max(1, window.innerHeight)
          : undefined
      );
      if (resolved.next && nextRuntime) {
        nextRuntime.update(
          resolved.nextProgress,
          delta,
          elapsedSeconds,
          cameraPointer,
          timestamp
        );
      }

      renderSceneTo(currentRuntime, currentTarget);
      const hasIncoming =
        Boolean(resolved.next && nextRuntime?.ready) &&
        resolved.transitionProgress > 0;
      if (hasIncoming && nextRuntime) {
        renderSceneTo(nextRuntime, nextTarget);
      }
      renderer.setRenderTarget(null);

      currentRuntime.camera.updateMatrixWorld(true);
      projectionView
        .copy(currentRuntime.camera.projectionMatrix)
        .multiply(currentRuntime.camera.matrixWorldInverse);

      const transitionProgress = hasIncoming
        ? resolved.transitionProgress
        : 0;
      const nextTexture = hasIncoming
        ? nextTarget.texture
        : currentTarget.texture;
      crossfadeMaterial.uniforms.tCurrent.value = currentTarget.texture;
      crossfadeMaterial.uniforms.tNext.value = nextTexture;
      crossfadeMaterial.uniforms.uProgress.value = transitionProgress;
      crossfadeMaterial.uniforms.uTime.value = elapsedSeconds;
      crossfadeMaterial.uniforms.uMouse.value.set(
        1 - shaderPointer.x,
        1 - shaderPointer.y
      );
      crossfadeMaterial.uniforms.uIsHero.value =
        resolved.current.id === "hero" &&
        resolved.next?.id === "sidekick"
          ? 1
          : 0;
      crossfadeMaterial.uniforms.uProjectionView.value.copy(projectionView);
      crossfadeMaterial.uniforms.uFadeCenterPoint.value.copy(
        currentRuntime.effects.fadeCenterPoint
      );
      crossfadeMaterial.uniforms.uDarken.value =
        currentRuntime.effects.darkenIntensity;

      renderer.setRenderTarget(crossfadeTarget);
      renderer.clear();
      renderer.render(crossfadeStage.scene, crossfadeStage.camera);

      let targetOverlayPosition = currentRuntime.effects.overlayPosition;
      if (hasIncoming && targetOverlayPosition > -1) {
        targetOverlayPosition +=
          (1 - targetOverlayPosition) * transitionProgress;
      }
      overlayPosition += (targetOverlayPosition - overlayPosition) * 0.15;
      overlayMaterial.uniforms.uPosition.value = overlayPosition;
      overlayMaterial.uniforms.uTime.value = elapsedSeconds;
      overlayMaterial.uniforms.uColor.value.copy(
        currentRuntime.effects.overlayColor
      );
      renderer.setRenderTarget(overlayTarget);
      renderer.clear();
      renderer.render(overlayStage.scene, overlayStage.camera);
      renderer.setRenderTarget(null);

      // UnrealBloomPass implements the same half-resolution mip-chain order.
      // The source effect's intensity scale is softer, so retain RealScene's
      // established numeric conversion while preserving the authored curve.
      bloomPass.enabled = currentRuntime.effects.bloomEnabled;
      bloomPass.strength = currentRuntime.effects.bloomIntensity * 0.12;
      bloomPass.threshold = currentRuntime.effects.bloomThreshold;
      bloomPass.radius = currentRuntime.effects.bloomRadius;
      composer.render(delta);

      canvas.dataset.sceneCurrent = resolved.current.id;
      canvas.dataset.sceneNext = hasIncoming
        ? (resolved.next?.id ?? "")
        : "";
      canvas.dataset.transitionProgress =
        transitionProgress.toFixed(6);
      container.dataset.sceneStatus = currentRuntime.status;
    };
    reconcileWindow(0);
    frameHandle = requestAnimationFrame(renderFrame);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameHandle);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", markMetricsDirty);
      window.removeEventListener("load", markMetricsDirty);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      for (const runtime of runtimes.values()) runtime.dispose();
      runtimes.clear();

      void environment.then((texture) => texture?.dispose());
      texturePass.dispose();
      bloomPass.dispose();
      smaaPass.dispose();
      outputPass.dispose();
      composer.dispose();
      currentTarget.dispose();
      nextTarget.dispose();
      crossfadeTarget.dispose();
      overlayTarget.dispose();
      crossfadeStage.geometry.dispose();
      overlayStage.geometry.dispose();
      crossfadeMaterial.dispose();
      overlayMaterial.dispose();
      noiseTexture.dispose();
      mudTexture.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      id="scene-portal"
      ref={containerRef}
      aria-hidden="true"
      className="canvas-wrapper"
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        marginBottom: "-100lvh",
        zIndex: 0,
        overflow: "clip",
        pointerEvents: "none",
        background: "#000",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
