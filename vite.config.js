import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import environment from 'vite-plugin-environment'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

dotenv.config({ path: './.env' })

if (process.env.PUBLIC_DFX_NETWORK === 'ic') {
  process.env.NODE_ENV === 'production'
}

export default defineConfig({
  define: {
    'process.env.NODE_ENV':
      process.env.NODE_ENV === 'production' ? '"production"' : '"development"'
  },
  build: {
    emptyOutDir: true
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
  },
  plugins: [
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', { prefix: 'DFX_' }),
    tailwindcss(), nodePolyfills(), enhancedImages(),
    sveltekit(),
  ],
  resolve: {
    alias: {
      $src: './src',
      $declarations: './src/declarations'
    }
  }
})
