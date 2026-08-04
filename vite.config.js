import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  // Relative base so the built site works from any mount path
  // (root domains and project-page subpaths alike).
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        bmw: resolve(__dirname, 'bmw.html'),
        congress: resolve(__dirname, 'congress.html'),
        optout: resolve(__dirname, 'optout.html'),
        why: resolve(__dirname, 'why.html')
      }
    }
  }
})
