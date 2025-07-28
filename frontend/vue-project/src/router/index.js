import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/workspaces',
      name: 'workspaces',
      component: () => import('../views/WorkspaceManager.vue'),
    },
    {
      path: '/ide',
      name: 'ide',
      component: () => import('../views/IDEView.vue'),
      props: route => ({
        sessionId: route.query.session,
        currentUsername: route.query.username
      })
    },
  ],
})

export default router
