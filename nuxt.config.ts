// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: [
    '@/assets/css/tailwind.css',
    '@/assets/scss/main.scss',
  ],
  experimental: {
    payloadExtraction: false
  },
  // vite: {
  //   server: {
  //     watch: {
  //       usePolling: true
  //     }
  //   },
  //   css: {
  //     preprocessorOptions: {
  //       scss: {
  //         additionalData: `@use "~/assets/scss/abstracts/index" as *;`
  //       }
  //     }
  //   }
  // }
})
