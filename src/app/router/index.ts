import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/pages/Home.vue') },
    {
      path: '/collection',
      name: 'collection',
      component: () => import('@/pages/Collection.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/signin', name: 'signin', component: () => import('@/pages/SignIn.vue') },
    { path: '/signup', name: 'signup', component: () => import('@/pages/SignUp.vue') },
  ],
})

import { useAuthStore } from '@/stores/auth'

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.user) {
    return { name: 'signin', query: { redirect: to.fullPath } }
  }
  // opcional: se já está logado, não deixa ir para signin/signup
  if ((to.name === 'signin' || to.name === 'signup') && auth.user) {
    return { name: 'collection' }
  }
})

export default router
