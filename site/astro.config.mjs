import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mikepbyrne.github.io',
  base: '/portfolio',
  output: 'static',
  build: {
    assets: '_assets',
  },
  trailingSlash: 'always',
});
