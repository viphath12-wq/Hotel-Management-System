import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'

createApp(App).use(createPinia().use(piniaPluginPersistedstate)).use(router).mount('#app')