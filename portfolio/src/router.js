import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import BlogIndex from './pages/BlogIndex.vue'
import BlogPost from './pages/BlogPost.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/blog', component: BlogIndex },
    { path: '/blog/:slug', component: BlogPost },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
