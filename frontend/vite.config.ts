import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import basicSsl from '@vitejs/plugin-basic-ssl'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl(), svgr()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
  },
  optimizeDeps: {
    exclude: ['@emotion/use-insertion-effect-with-fallbacks'],
  },
})