import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueGtag from 'vue-gtag'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

if (import.meta.env.VITE_GA_MEASUREMENT_ID !== undefined) {
  app.use(
    VueGtag,
    {
      config: { id: import.meta.env.VITE_GA_MEASUREMENT_ID }
    },
    router
  )
}

app.mount('#app')
