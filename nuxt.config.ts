import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/main.css', '~/assets/transitions.css'],
  modules: ['@nuxt/eslint'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  app: {
    head: {
      script: [
        { src: '/live2dcubismcore.min.js' },
        { src: '/live2d.min.js' }
      ]
    },
    pageTransition: { 
      name: 'page-fade', 
      mode: 'out-in' 
    },
  },
  runtimeConfig: {
    public: {
      GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY
    }
  },
  ssr: false,
})