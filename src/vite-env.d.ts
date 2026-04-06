/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
    readonly VITE_DATA_IMPORTER?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
