import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import NotesIndex from './pages/NotesIndex.vue'
import NotePost from './pages/NotePost.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/notes', component: NotesIndex },
    { path: '/notes/:slug', component: NotePost },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
