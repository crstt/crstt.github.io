// @ts-check
import { defineConfig } from 'astro/config';

// User page (Crstt.github.io) is served from the root, so base stays '/'.
// If this ever moves to a project repo, set base to '/<repo-name>/'.
export default defineConfig({
  site: 'https://crstt.github.io',
  base: '/',
  build: {
    inlineStylesheets: 'auto',
  },
});
