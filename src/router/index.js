import Vue from 'vue';
import VueRouter from 'vue-router';
// import welcome from '../components/welcome/welcome.vue'//欢迎
// import goods from '../components/goods/goods.vue'//下单商品页面
// import payPage from '../components/payPage/payPage.vue'//下单支付页面
// import paySuccess from '../components/paySuccess/paySuccess.vue'//下单详情
// import orderInfo from '../components/orderInfo/orderInfo.vue'//订单详情
// import orderList from '../components/orderList/orderList.vue'//订单列表
// import orderListAgain from '../components/orderListAgain/orderListAgain.vue'//再次进入时显示的订单列表
// import addressList from '../components/addressList/addressList.vue'//地址列表
// import addressEdit from '../components/addressEdit/addressEdit.vue'//添加地址
// import map1 from '../components/map/map1.vue'//添加地址

Vue.use(VueRouter);

// const welcome = () => import(/* webpackChunkName: "group-foo" */ '../components/welcome/welcome.vue')
// const goods = () => import(/* webpackChunkName: "group-foo" */ '../components/goods/goods.vue')
// const payPage = () => import(/* webpackChunkName: "group-foo" */ '../components/payPage/payPage.vue')
// const paySuccess = () => import(/* webpackChunkName: "group-foo" */ '../components/paySuccess/paySuccess.vue')
// const orderInfo = () => import(/* webpackChunkName: "group-foo" */ '../components/orderInfo/orderInfo.vue')
// const orderList = () => import(/* webpackChunkName: "group-foo" */ '../components/orderList/orderList.vue')
// const orderListAgain = () => import(/* webpackChunkName: "group-foo" */ '../components/orderListAgain/orderListAgain.vue')
// const addressList = () => import(/* webpackChunkName: "group-foo" */ '../components/addressList/addressList.vue')
// const addressEdit = () => import(/* webpackChunkName: "group-foo" */ '../components/addressEdit/addressEdit.vue')

// const welcome = r => require.ensure([], () => r(require('../components/welcome/welcome.vue')), 'group-foo')
// const goods = r => require.ensure([], () => r(require('../components/goods/goods.vue')), 'group-foo')
// const payPage = r => require.ensure([], () => r(require('../components/payPage/payPage.vue')), 'group-foo')
// const paySuccess = r => require.ensure([], () => r(require('../components/paySuccess/paySuccess.vue')), 'group-foo')
// const orderInfo = r => require.ensure([], () => r(require('../components/orderInfo/orderInfo.vue')), 'group-foo')
// const orderList = r => require.ensure([], () => r(require('../components/orderList/orderList.vue')), 'group-foo')
// const orderListAgain = r => require.ensure([], () => r(require('../components/orderListAgain/orderListAgain.vue')), 'group-foo')
// const addressList = r => require.ensure([], () => r(require('../components/addressList/addressList.vue')), 'group-foo')
// const addressEdit = r => require.ensure([], () => r(require('../components/addressEdit/addressEdit.vue')), 'group-foo')





// export default new Router({
//   linkActiveClass: 'active',
//   routes,
//   base: '/wxdc/dist/',
  
// });

export default new VueRouter({
  
  linkActiveClass: 'active',
  base: '/wxdc/dist/',
  routes: [
    {
      path: '/welcome',
      component: resolve => require(['../components/welcome/welcome.vue'], resolve),
      meta: {
        title: '欢迎'
      }
    }, {
      path: '/goods',
      component: resolve => require(['../components/goods/goods.vue'], resolve),
      name: "goods",
      meta: {
        keepAlive: true // 需要被缓存
      }
    }, {
      path: '/payPage',
      component: resolve => require(['../components/payPage/payPage.vue'], resolve),
      name: "payPage"
    }, {
      path: '/paySuccess',
      component: resolve => require(['../components/paySuccess/paySuccess.vue'], resolve),
      name: "paySuccess"
    }, {
      path: '/orderInfo',
      component: resolve => require(['../components/orderInfo/orderInfo.vue'], resolve),
      name: "orderInfo"
    }, {
      path: '/orderList',
      component: resolve => require(['../components/orderList/orderList.vue'], resolve),
      name: "orderList"
    }, {
      path: '/orderListAgain',
      component: resolve => require(['../components/orderListAgain/orderListAgain.vue'], resolve),
      name: "orderListAgain"
    }, {
      path: '/addressList',
      component: resolve => require(['../components/addressList/addressList.vue'], resolve),
      name: "addressList"
    }, {
      path: '/addressEdit',
      component: resolve => require(['../components/addressEdit/addressEdit.vue'], resolve),
      name: "addressEdit"
    }]
});