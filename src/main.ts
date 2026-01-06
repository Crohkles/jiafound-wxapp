import { createSSRApp } from "vue";
import App from "./App.vue";
import { BASE_URL } from './config'

uni.addInterceptor('request', {
  invoke(args) {
    // 如果 url 不是以 http 开头，则拼接全局域名
    if (!args.url.startsWith('http')) {
      args.url = BASE_URL + args.url
    }
    
    args.header = {
      ...args.header,
      'Authorization': 'Bearer ' + (uni.getStorageSync('token') || '')
    }
  }
})

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
