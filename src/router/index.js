import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    beforeEnter: (to, from, next) => {
      if(Store.getters.loggedIn && Store.getters.superUser) next('/admin');
      else if(Store.getters.loggedIn && !Store.getters.superUser) next('/dashboard');
      else next();
    }
  }, 
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/Admin.vue'),
    beforeEnter: (to, from, next) => {
      if(Store.getters['user_auth/loggedIn'] && Store.getters['user_auth/superUser']) { next(); }
      else if(Store.getters['user_auth/loggedIn'] && !Store.getters['user_auth/superUser']) { next('/dashboard?error=91'); }
      else { next('/login?error=90'); }
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    beforeEnter: (to, from, next) => {
      if(Store.getters['user_auth/loggedIn']) { next(); }
      else { next('/login?error=90'); }
    }
  },
  {
    path: '*',
    name: '404',
    component: () => import('@/views/404.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
