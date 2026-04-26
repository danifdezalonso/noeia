import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

// Workaround: @tailwindcss/vite:generate:serve includes URLs matching /&lang\.css/,
// which vite-plugin-inspect generates as `?direct&...&lang.css` for raw Vue SFC
// inspection. When that happens Tailwind receives the full SFC content (including
// the <script> block) as CSS and throws "Invalid declaration". Excluding ?direct
// prevents the false-positive parse error.
function tailwindcssFixed(): Plugin | Plugin[] {
  const plugins = ([tailwindcss()] as (Plugin | Plugin[])[]).flat() as Plugin[]
  return plugins.map((plugin) => {
    if (plugin.name !== '@tailwindcss/vite:generate:serve') return plugin
    const transform = plugin.transform as any
    if (typeof transform !== 'object' || !transform?.filter?.id) return plugin
    return {
      ...plugin,
      transform: {
        ...transform,
        filter: {
          ...transform.filter,
          id: {
            ...transform.filter.id,
            exclude: [...(transform.filter.id.exclude ?? []), /\?direct/],
          },
        },
      },
    }
  })
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: 'vercel',
  },
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
      { path: '~/components/onboarding' },
      '~/components',
    ],
  },
  vite: {
    plugins: [tailwindcssFixed()]
  }
})
