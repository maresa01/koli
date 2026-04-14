/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_API_PROXY_TARGET?: string;
    readonly VITE_SHOW_API_STATUS?: string;
    readonly VITE_BETA_API_KEY?: string;
  }