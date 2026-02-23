import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'vue-multiselect/dist/vue-multiselect.css'
import 'primeicons/primeicons.css'

createApp(App)
  .use(router)
  .mount('#app')