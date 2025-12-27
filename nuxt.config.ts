import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Manhwa Tracker',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Track your read manhwas, get notifications for new chapters, and manage your reading list with Manhwa Tracker.',
        },
        {
          name: 'keywords',
          content:
            'manhwa, manhua, manga, tracker, notifications, reading list, sorting, organization',
        },
      ],
    },
  },
  nitro: {
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      '0 */12 * * *': ['manhwa:retrieveLastChapters'],
    },
  },
  modules: ['@nuxt/icon', '@nuxt/eslint'],
  devtools: { enabled: true },
  css: ['@/assets/css/tailwind.css', '@/assets/css/global.css'],
  runtimeConfig: {
    mongodbUri: '', // Provided via NUXT_MONGODB_URI env variable
    jwtSecret: '', // Provided via NUXT_JWT_SECRET env variable
    flaresolverrUrl: '', // Provided via NUXT_FLARESOLVERR_URL env variable
    public: {
      env: '', // Provided via NUXT_PUBLIC_ENV env variable
    },
  },
  compatibilityDate: '2025-07-15',
  vite: {
    plugins: [tailwindcss()],
  },
});
