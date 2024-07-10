import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from '@vercel/remix/vite';
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isVercel = process.env.VERCEL;

export default defineConfig({
  plugins: [
    remix({
      presets: isVercel ? [vercelPreset()] : [],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
});
