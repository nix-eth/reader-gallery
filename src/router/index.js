import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NftView from '../views/NftView.vue'
import CollectionView from '../views/CollectionView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/:contract/:tokenId(\\d+)',
      component: NftView
    },
    {
      path: '/:network(goerli)/:contract/:tokenId(\\d+)',
      component: NftView
    },
    {
      path: '/:contract',
      component: CollectionView
    },
    {
      path: '/:network(goerli)/:contract',
      component: CollectionView
    },
    {
      path: '/:pathMatch(.*)*',
      component: NotFoundView
    }
  ]
})

export default router
