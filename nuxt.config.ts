import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
    },
  },
  css: ['~/assets/css/main.css'],
  components: {
    dirs: [
      { path: '~/components/ui', ignore: ['**/*.ts'] },
      { path: '~/components/shell' },
      { path: '~/components/calendar' },
      '~/components',
    ],
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
