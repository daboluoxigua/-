import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js';
import Vuex from 'vuex'
import store from './vuex/store'

import 'lib-flexible/flexible.js'//自适应分辨率

import Mint from 'mint-ui';//mint-ui组件
import 'mint-ui/lib/style.css'//mint-ui组件样式
import './common/css/my-mint.css'//mint-ui组件样式覆盖

import VueAMap from 'vue-amap'//高德地图

import './common/css/reset.css';

VueAMap.initAMapApiLoader({
  key: 'd14ad4c473160cbc9a6aef971e2d6a11',
  plugin: ['AMap.Geolocation']
});
Vue.config.productionTip = false

Vue.use(Vuex);
Vue.use(VueAMap);
Vue.use(Mint);
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
