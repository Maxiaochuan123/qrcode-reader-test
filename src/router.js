/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-18 10:13:28
 * @LastEditTime: 2019-08-18 18:40:03
 * @LastEditors: Please set LastEditors
 */
import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/jsQR',
      name: 'jsQR',
      component: () => import('./views/jsQR.vue')
    },
    {
      path: '/qrcodeReader',
      name: 'qrcodeReader',
      component: () => import('./views/qrcodeReader.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('./views/test.vue')
    }
  ]
})
