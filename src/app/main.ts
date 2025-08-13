import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

import App from './App.vue'
import router from './router'
import '../styles/index.css'

const app = createApp(App)

app.use(createPinia())
const auth = useAuthStore()
auth.load()
app.use(router)

app.mount('#app')
