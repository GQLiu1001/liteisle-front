import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'
import './style.css'
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

// 创建主应用
const app = createApp(App)
const pinia = createPinia()

const options: PluginOptions = {
    transition: "Vue-Toastification__bounce",
    maxToasts: 5,
    newestOnTop: true,
    position: POSITION.TOP_CENTER,
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false,
    containerClassName: "my-toast-container",
};

app.use(pinia)
app.use(router)
app.use(Toast, options);

app.mount('#app') 