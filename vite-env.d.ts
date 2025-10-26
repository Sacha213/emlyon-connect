/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VAPID_PUBLIC_KEY: string
  // Ajoute d'autres variables d'environnement VITE_ ici
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
