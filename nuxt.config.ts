// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    OPENAI_API_TOKEN: ''
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss']
})
