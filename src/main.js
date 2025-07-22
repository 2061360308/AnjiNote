import "./assets/main.css";
import 'element-plus/dist/index.css';
import App from "./App.vue";
import { createApp } from "vue";

const app = createApp(App);
app.mount("#app");

window.addEventListener("pywebviewready", function () {
  console.log("pywebview is ready");
  // @ts-ignore
  window.python = pywebview.api;
  console.log("pywebview.api is ready", window.python);  
});
