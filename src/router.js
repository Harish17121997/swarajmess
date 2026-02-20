import { createRouter, createWebHistory } from 'vue-router'

import AdminLogin from './pages/AdminLogin.vue'
import AdminDashboard from './pages/AdminDashboard.vue'
import MenuView from './pages/MenuView.vue'

const routes = [
  {
    path: '/',
    component: MenuView
  },
  {
    path: '/login',
    component: AdminLogin
  },
  {
    path: '/admin',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* 🔐 ROUTE GUARD (IMPORTANT) */
router.beforeEach((to, from, next) => {

  const isAdminLoggedIn = localStorage.getItem('messAdmin')

  // If trying to open admin page without login
  if (to.meta.requiresAuth && !isAdminLoggedIn) {
    next('/login')
    return
  }

  // If already logged in and opens login page
  if (to.path === '/login' && isAdminLoggedIn) {
    next('/admin')
    return
  }

  next()
})

export default router