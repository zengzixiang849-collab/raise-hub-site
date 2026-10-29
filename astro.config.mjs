// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH let the same code run locally ("/") and on
// GitHub Pages under a sub-path (e.g. BASE_PATH=/raise-hub/).
const site = process.env.SITE_URL || 'http://localhost:4321';
const rawBase = process.env.BASE_PATH || '/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
