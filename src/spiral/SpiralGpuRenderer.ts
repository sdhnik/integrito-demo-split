import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { LAYER_ROTATION_FACTORS } from "./spiralLayers";

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/**
 * Step 4.2 — Idle-only composite of three baked spiral layers.
 * No ripple / pointer uniforms (deferred).
 */
const fragment = /* glsl */ `
precision highp float;

uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uLayerSize;
uniform float uPhase;
uniform sampler2D uLayer0;
uniform sampler2D uLayer1;
uniform sampler2D uLayer2;
uniform float uRot0;
uniform float uRot1;
uniform float uRot2;

varying vec2 vUv;

vec4 sampleLayer(sampler2D map, vec2 screen, float rotFactor) {
  float angle = uPhase * rotFactor;
  float c = cos(angle);
  float s = sin(angle);
  vec2 p = screen - uCenter;
  // Inverse of Canvas 2D rotate(angle) with y-down coordinates.
  vec2 local = vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
  vec2 uv = local / uLayerSize + 0.5;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
  return texture2D(map, uv);
}

vec4 sourceOver(vec4 src, vec4 dst) {
  return src + dst * (1.0 - src.a);
}

void main() {
  vec2 screen = vec2(vUv.x * uResolution.x, (1.0 - vUv.y) * uResolution.y);

  vec4 color = vec4(0.0);
  color = sourceOver(sampleLayer(uLayer0, screen, uRot0), color);
  color = sourceOver(sampleLayer(uLayer1, screen, uRot1), color);
  color = sourceOver(sampleLayer(uLayer2, screen, uRot2), color);

  gl_FragColor = vec4(color.rgb * color.a, color.a);
}
`;

export type SpiralGpuLayers = {
  layers: HTMLCanvasElement[];
  layerSize: number;
  centerX: number;
  centerY: number;
};

/**
 * OGL compositor: uploads baked Canvas 2D layers once, rotates on the GPU.
 */
export class SpiralGpuRenderer {
  readonly renderer: Renderer;
  readonly gl: Renderer["gl"];
  private readonly program: Program;
  private readonly mesh: Mesh;
  private readonly textures: Texture[];
  private width = 0;
  private height = 0;
  private disposed = false;

  private constructor(
    renderer: Renderer,
    program: Program,
    mesh: Mesh,
    textures: Texture[]
  ) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.program = program;
    this.mesh = mesh;
    this.textures = textures;
  }

  static isSupported(): boolean {
    try {
      const probe = document.createElement("canvas");
      return !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
      return false;
    }
  }

  static tryCreate(canvas: HTMLCanvasElement): SpiralGpuRenderer | null {
    if (!SpiralGpuRenderer.isSupported()) return null;

    try {
      const renderer = new Renderer({
        canvas,
        width: 1,
        height: 1,
        dpr: 1,
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
        autoClear: true,
        webgl: 2,
      });
      if (!renderer.gl) return null;

      // Keep CSS-driven ~145vw layout; OGL setSize writes inline px.
      canvas.style.width = "";
      canvas.style.height = "";

      const gl = renderer.gl;
      const blank = document.createElement("canvas");
      blank.width = blank.height = 1;

      const textures = [0, 1, 2].map(
        () =>
          new Texture(gl, {
            image: blank,
            generateMipmaps: false,
            minFilter: gl.LINEAR,
            magFilter: gl.LINEAR,
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            flipY: false,
            premultiplyAlpha: false,
          })
      );

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uResolution: { value: [1, 1] },
          uCenter: { value: [0, 0] },
          uLayerSize: { value: 1 },
          uPhase: { value: 0 },
          uLayer0: { value: textures[0] },
          uLayer1: { value: textures[1] },
          uLayer2: { value: textures[2] },
          uRot0: { value: LAYER_ROTATION_FACTORS[0] },
          uRot1: { value: LAYER_ROTATION_FACTORS[1] },
          uRot2: { value: LAYER_ROTATION_FACTORS[2] },
        },
        transparent: false,
        depthTest: false,
        depthWrite: false,
        cullFace: false,
      });

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      return new SpiralGpuRenderer(renderer, program, mesh, textures);
    } catch {
      return null;
    }
  }

  setSize(width: number, height: number) {
    if (this.disposed) return;
    this.width = width;
    this.height = height;
    this.renderer.dpr = 1;
    this.renderer.setSize(width, height);
    this.gl.canvas.style.width = "";
    this.gl.canvas.style.height = "";
    this.program.uniforms.uResolution.value = [width, height];
  }

  /** Upload baked typography layers. Call only when the bake cache changes. */
  setLayers({ layers, layerSize, centerX, centerY }: SpiralGpuLayers) {
    if (this.disposed) return;
    for (let i = 0; i < 3; i++) {
      const texture = this.textures[i];
      texture.image = layers[i];
      texture.needsUpdate = true;
    }
    this.program.uniforms.uLayerSize.value = layerSize;
    this.program.uniforms.uCenter.value = [centerX, centerY];
  }

  render(phase: number) {
    if (this.disposed || !this.width || !this.height) return;
    this.program.uniforms.uPhase.value = phase;
    this.renderer.render({ scene: this.mesh });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const gl = this.gl;
    for (const texture of this.textures) {
      gl.deleteTexture(texture.texture);
    }
    if (this.program.program) gl.deleteProgram(this.program.program);
  }
}
