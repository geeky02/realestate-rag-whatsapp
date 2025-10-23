/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string
  readonly VITE_EVOLUTION_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

