import Vue from 'vue';
import Router from 'vue-router';
import welcome from '../components/welcome/welcome.vue'//欢迎
import goods from '../components/goods/goods.vue'//下单商品页面
import payPage from '../components/payPage/payPage.vue'//下单支付页面
import paySuccess from '../components/paySuccess/paySuccess.vue'//下单详情
import orderInfo from '../components/orderInfo/orderInfo.vue'//订单详情
import orderList from '../components/orderList/orderList.vue'//订单列表
import orderListAgain from '../components/orderListAgain/orderListAgain.vue'//再次进入时显示的订单列表
import addressList from '../components/addressList/addressList.vue'//地址列表
import addressEdit from '../components/addressEdit/addressEdit.vue'//添加地址


Vue.use(Router);

const routes = [
  {
    path: '/welcome',
    component: welcome,
    meta: {
      title: '欢迎'
    }
  }, {
    path: '/goods',
    component: goods,
    name: "goods",
    meta: {
      keepAlive: true // 需要被缓存
    }
  }, {
    path: '/payPage',
    component: payPage,
    name: "payPage"
  }, {
    path: '/paySuccess',
    component: paySuccess,
    name: "paySuccess"
  }, {
    path: '/orderInfo',
    component: orderInfo,
    name: "orderInfo"
  }, {
    path: '/orderList',
    component: orderList,
    name: "orderList"
  }, {
    path: '/orderListAgain',
    component: orderListAgain,
    name: "orderListAgain"
  }, {
    path: '/addressList',
    component: addressList,
    name: "addressList"
  }, {
    path: '/addressEdit',
    component: addressEdit,
    name: "addressEdit"
  }];

export default new Router({
  linkActiveClass: 'active',
  routes,
  base: '/wxdc/dist/',
  // mode: 'history',
});