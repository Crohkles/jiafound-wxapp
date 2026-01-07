import { createSSRApp } from "vue";
import * as Pinia from 'pinia';
import { createPersistedState } from "pinia-plugin-persistedstate";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  
  // 创建 Pinia 实例
  const store = Pinia.createPinia();
  
  // 配置持久化插件（适配 UniApp）
  store.use(
    createPersistedState({
      storage: {
        getItem(key: string) {
          return uni.getStorageSync(key);
        },
        setItem(key: string, value: string) {
          uni.setStorageSync(key, value);
        }
      }
    })
  );
  
  // 注册 Pinia
  app.use(store);
  
  return {
    app,
    Pinia,
  };
}
