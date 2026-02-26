// router.js
import { createRouter, createWebHistory } from 'vue-router'

import AdminLogin from './pages/AdminLogin.vue'
import AdminDashboard from './pages/AdminDashboard.vue'
import MenuView from './pages/MenuView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MenuView
  },
  {
    path: '/login',
    name: 'Login',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* 🔐 ROUTE GUARD */
router.beforeEach((to, from, next) => {

  // Check token instead of just messAdmin flag
  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  // If route requires authentication
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      next({ name: 'Login' })
    } else {
      next()
    }
    return
  }

  // If already logged in and tries to open login page
  if (to.name === 'Login' && isLoggedIn) {
    next({ name: 'AdminDashboard' })
    return
  }

  next()
})

export default router