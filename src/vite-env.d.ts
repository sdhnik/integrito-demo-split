/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DETECTION_MODE?: "mock" | "disabled";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
