import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ContentView from '../views/ContentView.vue'
import CodeView from '../views/CodeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/content/:type', name: 'content', component: ContentView },
    { path: '/content/:type/:problems', name: 'problem-set', component: ContentView },
    { path: '/code/:type/:problems/:problem/:title?', name: 'code', component: CodeView },
  ],
})

export default router
