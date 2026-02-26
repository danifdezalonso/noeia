// Eagerly initialize the Supabase singleton during Nuxt plugin startup.
// Plugin context is always a valid Nuxt composable context, so
// useRuntimeConfig() is guaranteed to succeed here. After this runs,
// the _client cache is warm and useSupabase() called later from setTimeout
// callbacks or event handlers will always return the cached client.
export default defineNuxtPlugin(() => {
  useSupabase()
})
