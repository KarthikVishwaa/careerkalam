import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed as its own isolated folder on the Hostinger static host
// (public_html/stream-selection/), deliberately outside the main site's own
// Vite build/router — see HANDOFF.md's "Integration into careerkalam360.com"
// section. base must match that folder exactly so built asset URLs resolve.
export default defineConfig({
  base: '/stream-selection/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
