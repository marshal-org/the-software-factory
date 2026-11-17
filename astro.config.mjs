import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thesoftwarefactory.site',
  trailingSlash: 'always',
  integrations: [
    // Lights Out is a static page in public/, so it is listed by hand.
    sitemap({ customPages: ['https://thesoftwarefactory.site/lights-out/'], filter: page => !page.includes('/404') }),
  ],
});
