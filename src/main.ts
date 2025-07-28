import "./assets/main.css";
import 'element-plus/dist/index.css';
import App from "./App.vue";
import { createPinia } from 'pinia'
import { createApp } from "vue";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
