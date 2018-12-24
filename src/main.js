import Vue from 'vue'
import App from './App.vue'
import viewprot from './common/js/viewprort.js'
import router from './router/index.js';
import Mint from 'mint-ui';
import 'mint-ui/lib/style.css'
import './common/css/my-mint.css'
import Vuex from 'vuex'
import store from './vuex/store'
import 'lib-flexible/flexible.js'
import VueAMap from 'vue-amap';
import 'element-ui/lib/theme-chalk/index.css';

import './common/css/reset.css';

Vue.use(VueAMap);
VueAMap.initAMapApiLoader({
  key: 'd14ad4c473160cbc9a6aef971e2d6a11',
  plugin: ['AMap.Geolocation']
});
Vue.use(Vuex)
Vue.config.productionTip = false
Vue.use(Mint);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
