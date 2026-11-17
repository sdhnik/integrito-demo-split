import { useEffect, useRef } from "react";
import { getCurrentTheme, type Theme } from "../theme";
import {
  bakeSpiralLayers,
  spiralCacheKey,
  type SpiralBakeResult,
} from "../spiral/spiralLayers";
import {
  initialSettings,
  ROTATION_SPEED,
  type CanvasSettings,
} from "../spiral/canvasSettings";
import { SPIRAL_PHRASES } from "../spiral/spiralGeometry";
import { SpiralGpuRenderer } from "../spiral/SpiralGpuRenderer";
import "./SpiralBackground.css";

/** Split presentation of the Original Minimal spiral. */
const SPLIT_SPIRAL_SETTINGS: CanvasSettings = {
  ...initialSettings,
  speed: "Slow",
  rippleStrength: "Very Subtle",
  blueAccent: "Rich",
  ringSpacing: "Minimal",
  textFragmentation: "More Open",
  ringCountMode: "Responsive",
  accent: "Integrito Blue",
};

const IDLE_RAD_PER_SEC = ROTATION_SPEED.Slow; // 0.0215

/** Static Canvas 2D composite — WebGL unavailable / context lost / reduced-motion freeze. */
function paintStaticSpiral(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baked: SpiralBakeResult
) {
  ctx.clearRect(0, 0, width, height);
  const { layers, layerSize, centerX, centerY } = baked;
  for (let i = 0; i < layers.length; i++) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.drawImage(layers[i], -layerSize / 2, -layerSize / 2);
    ctx.restore();
  }
}

/**
 * Step 4.2 — GPU idle rotation of the stage-level typography spiral.
 * Bake stays Canvas 2D; animation is OGL layer rotation only (no ripples).
 */
function SpiralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let width = 0;
    let height = 0;
    let mobile = false;
    let cacheKey = "";
    let theme: Theme = getCurrentTheme();
    let baked: SpiralBakeResult | null = null;
    let phase = 0;
    let frame = 0;
    let last = 0;
    let nextPaint = 0;
    let inView = true;
    let disposed = false;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let gpu = SpiralGpuRenderer.tryCreate(canvas);
    let mode: "gpu" | "static" = gpu ? "gpu" : "static";
    let staticCtx: CanvasRenderingContext2D | null = null;

    if (mode === "static") {
      staticCtx = canvas.getContext("2d");
      if (!staticCtx) return;
    }

    const bake = (): { result: SpiralBakeResult; changed: boolean } | null => {
      if (!width || !height) return null;
      const viewportWidth = window.innerWidth;
      const key = spiralCacheKey(
        width,
        height,
        viewportWidth,
        theme,
        SPLIT_SPIRAL_SETTINGS,
        SPIRAL_PHRASES,
        0
      );
      if (key === cacheKey && baked) return { result: baked, changed: false };
      cacheKey = key;
      baked = bakeSpiralLayers({
        width,
        height,
        viewportWidth,
        mobile,
        theme,
        settings: SPLIT_SPIRAL_SETTINGS,
        phrases: SPIRAL_PHRASES,
        ringCountSubtract: 0,
      });
      return { result: baked, changed: true };
    };

    const prepare = () => {
      const next = bake();
      if (!next) return;
      const drawPhase = reduced.matches ? 0 : phase;
      if (mode === "gpu" && gpu) {
        if (next.changed) gpu.setLayers(next.result);
        gpu.render(drawPhase);
      } else if (staticCtx) {
        paintStaticSpiral(staticCtx, width, height, next.result);
      }
    };

    const tick = (now: number) => {
      const fps = mobile ? 30 : 60;
      const interval = 1000 / fps;
      if (now >= nextPaint) {
        const delta = last ? Math.min(now - last, 100) / 1000 : 0;
        last = now;
        nextPaint += interval;
        if (nextPaint <= now) nextPaint = now + interval;
        phase += delta * IDLE_RAD_PER_SEC;
        if (gpu) gpu.render(phase);
      }
      frame = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = nextPaint = 0;
    };

    const startLoop = () => {
      stopLoop();
      if (disposed || document.hidden || !inView || reduced.matches || mode !== "gpu") {
        prepare();
        return;
      }
      prepare();
      frame = requestAnimationFrame(tick);
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      stopLoop();
      gpu?.dispose();
      gpu = null;
      mode = "static";
      staticCtx = canvas.getContext("2d");
      cacheKey = "";
      baked = null;
      prepare();
    };

    const resize = new ResizeObserver(([entry]) => {
      width = Math.max(1, Math.round(entry.contentRect.width));
      height = Math.max(1, Math.round(entry.contentRect.height));
      mobile = matchMedia("(max-width: 760px)").matches;
      cacheKey = "";
      baked = null;

      if (mode === "gpu" && gpu) {
        gpu.setSize(width, height);
      } else if (staticCtx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        staticCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      startLoop();
    });

    const visibility = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio > 0;
        if (inView) startLoop();
        else stopLoop();
      },
      { root: null, threshold: 0 }
    );

    const onTheme = (event: Event) => {
      theme = (event as CustomEvent<Theme>).detail ?? getCurrentTheme();
      cacheKey = "";
      baked = null;
      prepare();
    };

    const onReduced = () => startLoop();
    const onVisible = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    resize.observe(canvas);
    visibility.observe(wrap);
    window.addEventListener("integrito-theme", onTheme);
    document.addEventListener("visibilitychange", onVisible);
    reduced.addEventListener("change", onReduced);
    if (mode === "gpu") {
      canvas.addEventListener("webglcontextlost", onContextLost);
    }

    return () => {
      disposed = true;
      stopLoop();
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener("integrito-theme", onTheme);
      document.removeEventListener("visibilitychange", onVisible);
      reduced.removeEventListener("change", onReduced);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gpu?.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="spiral-background" aria-hidden="true">
      <canvas ref={canvasRef} className="spiral-background__canvas" />
    </div>
  );
}

export default SpiralBackground;
