<template>
  <div id="app">
      <transition :name="transitionName">
        <keep-alive>
          <router-view class="Router" :key="$route.fullPath"></router-view>
        </keep-alive>
      </transition>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
import init from "./common/js/init";
import * as AJAX from './common/js/ajax'
const { getOpenid,getJSParam } = AJAX.weixinAjax
const { args } = AJAX
export default {
  name: "app",
  data() {
    return {
      transitionName: "slide-right", // 默认动态路由变化为slide-right
    };
  },
  watch: {
    $route() {
      let isBack = this.$router.isBack; //  监听路由变化时的状态为前进还是后退
      if (isBack) {
        this.transitionName = "slide-right";
      } else {
        this.transitionName = "slide-left";
      }
      this.$router.isBack = false;
    }
  },
  mounted(){
    document.title = window.localStorage.getItem("welcomeSname");
    if(args('code')){
      getJSParam(args('appid'),args('brandid'),args('storeid'));
      this.getOpen()
    }
  },
  methods:{
    getOpen(){ //获取openid
      if(window.sessionStorage.getItem('openid')){
          this.findOrder();
      }else {
          const browserName = window.localStorage.getItem("browserName");
          if(browserName == 1){
            getOpenid(args('appid'),args('brandid'),args('auth_code').replace("#/", ""),args('storeid'),this.findOrder)
          }else if(browserName == 2){
            getOpenid(args('appid'),args('brandid'),args('code'),args('storeid'),this.findOrder)
          }
      }
    },
    findOrder(){
      axios.post('../../wx/findOrder', qs.stringify({
          "appid": window.localStorage.getItem('appid'),
          "storeid": window.localStorage.getItem('storeid'),
          "openid": window.sessionStorage.getItem('openid'),
          "brandid": window.localStorage.getItem('brandid')
        })).then(d => {
          const req = d.data
          if (req.result == 0) {
            if (req.content.length > 0) {
              req.content.forEach(element => {
                window.sessionStorage.setItem("phoneNum", element.memberPhoneNumber);
              });
              this.$router.push({ path: "/orderListAgain"});
            }else{
              this.onJump()
            }
          }
        })
    },
    onJump(){
      let displayIndex = window.localStorage.getItem('displayIndex');
      let str = window.location.href
      str = str.substring(str.length-9,str.length)

      if(str == 'orderList'){
        this.$router.replace({path:'/orderList'})
        return
      }
      if(displayIndex == 'true'){
        this.$router.replace({path:'/welcome'})
      }else{
        this.$router.replace({path:'/goods'})
      }
    }
  }
};

</script>

<style lang='less'>
@import "./common/css/reset.css";
@import "./common/css/common.less";
@import '//at.alicdn.com/t/font_757601_czyhf2grbp.css';
.Router {
     position: absolute;
     width: 100%;
     transition: all .8s ease;
     top: 0;
     bottom: 0;
     display:flex;
     flex-direction:column;
}

.slide-left-enter,
 .slide-right-leave-active {
     opacity: 0;
    -webkit-transform: translate(100%, 0);
    transform: translate(100%, 0);
}

.slide-left-leave-active,
.slide-right-enter {
     opacity: 0;
    -webkit-transform: translate(-100%, 0);
    transform: translate(-100% 0);
}
.btn{background: #ea5a49;border: none;color: #fff; height: 80px;width: 100%;}
</style>
