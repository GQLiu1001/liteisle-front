import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      return isLoggedIn ? '/home' : '/login'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/pages/HomePage.vue')
  },
  {
    path: '/drive',
    name: 'drive',
    component: () => import('@/pages/DrivePage.vue')
  },
  {
    path: '/transfer',
    name: 'transfer',
    component: () => import('@/pages/TransferPage.vue')
  },
  {
    path: '/music',
    name: 'music',
    component: () => import('@/pages/MusicPage.vue')
  },
  {
    path: '/docs',
    name: 'docs',
    component: () => import('@/pages/DocsPage.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：检查登录状态
router.beforeEach((to: any, from: any, next: any) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  // 如果没有登录且不是去登录页，重定向到登录页
  if (!isLoggedIn && to.name !== 'login') {
    next({ name: 'login' })
  } 
  // 如果已经登录且去登录页，重定向到首页
  else if (isLoggedIn && to.name === 'login') {
    next({ name: 'home' })
  } 
  // 其他情况正常导航
  else {
    next()
  }
})

export default router 