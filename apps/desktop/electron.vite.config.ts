import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const shared = resolve(__dirname, '../../packages/shared/src')
const assets = resolve(__dirname, 'assets')

export default defineConfig({
  main: {
    // Bundle the workspace TS packages used by the app into the main process (they
    // ship as source, not built JS). @jex/ai-core is NOT here: it's no longer imported
    // by the app — the host dynamically-imports it from the downloaded plugin at runtime.
    plugins: [externalizeDepsPlugin({ exclude: ['@jex/ai-contract', '@jex/shared'] })],
    resolve: { alias: { '@shared': shared } },
    build: {
      rollupOptions: { input: { index: resolve(__dirname, 'src/main/index.ts') } },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { '@shared': shared } },
    build: {
      rollupOptions: { input: { index: resolve(__dirname, 'src/preload/index.ts') } },
    },
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        '@ds': resolve(__dirname, 'src/renderer/src/ui/design-system'),
        '@ui': resolve(__dirname, 'src/renderer/src/ui'),
        '@assets': assets,
        '@shared': shared,
      },
    },
    // Brand assets live in the repo-root assets/ dir (outside the renderer root), so
    // the dev server must be allowed to read from there.
    server: { fs: { allow: [resolve(__dirname)] } },
    plugins: [react()],
    build: {
      rollupOptions: { input: { index: resolve(__dirname, 'src/renderer/index.html') } },
    },
  },
})
