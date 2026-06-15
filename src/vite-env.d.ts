/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_BASE_URL: string;
  readonly VITE_PROJECT_KEY: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_CLIENT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// `inert` ships in modern browsers but isn't in this @types/react version yet.
import 'react';
declare module 'react' {
  interface HTMLAttributes<T> {
    inert?: boolean;
  }
}
