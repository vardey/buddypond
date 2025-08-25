import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import {createHtmlPlugin} from 'vite-plugin-html';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    // Copy vendor scripts to include them in the bundle
    viteStaticCopy({
      targets: [
        {
          src: '../apps/based/admin/vendor/source-map.bundle.js',
          dest: 'vendor'
        }
      ]
    }),
    // Embed HTML files as strings
    createHtmlPlugin({
      inject: {
        data: {
          // Map HTML files to variables
          adminHtml: '../apps/based/admin/admin.html'
        }
      }
    }),
    // Inline CSS into the JS bundle
    cssInjectedByJsPlugin()
  ],
  build: {
    outDir: 'dist',
    assetsDir: '',
    rollupOptions: {
      input: {
        main: '../bp.js', // Entry point
      },
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '/v5': '/v5' // Ensure paths resolve correctly
    }
  }
});