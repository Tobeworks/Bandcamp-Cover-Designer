import { createRouter, createWebHistory } from 'vue-router'
import HeroView from '../views/HeroView.vue'
import AppView from '../views/AppView.vue'
import NotFoundView from '../views/NotFoundView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HeroView },
    { path: '/app', component: AppView },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
})
