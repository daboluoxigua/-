(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-dc585d2a"],{7454:function(e,t,a){},ba1a:function(e,t,a){"use strict";var o=a("7454"),n=a.n(o);n.a},c277:function(e,t,a){"use strict";a.r(t);var o=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"hello"},[a("div",{staticClass:"userinfo"},[a("img",{attrs:{src:e.headimgurl,alt:""}}),a("p",[e._v(e._s(e.nickname))])]),1==e.browserName?a("input",{ref:"phoneNum",staticClass:"phoneNum",attrs:{type:"number",min:"11",max:"11",placeholder:"请输入会员手机号码"}}):e._e(),a("button",{staticClass:"btn",on:{click:function(t){e.routerTo()}}},[e._v("开始点餐")])])},n=[],r=(a("a481"),a("bc3a")),i=a.n(r),s={data:function(){return{headimgurl:""}},created:function(){this.headimgurl=window.localStorage.getItem("headimgurl"),this.nickname=window.localStorage.getItem("nickname"),this.browserName=window.localStorage.getItem("browserName")},methods:{routerTo:function(){var e=this;if(1==this.browserName){var t=this.$refs.phoneNum.value;if(t){if(!/^1[34578]\d{9}$/.test(t))return alert("手机号码有误,请重填"),!1;i.a.get("/public/members/getMemberInfo",{params:{appId:window.localStorage.getItem("appid"),storeId:window.localStorage.getItem("storeid"),brandId:window.localStorage.getItem("brandid"),account:t}}).then(function(a){var o=a.data;if(null==o.content)return alert("请输入正确的会员手机号码"),!1;window.sessionStorage.setItem("phoneNum",t);var n=window.localStorage.getItem("repastPopulation");n&&"false"!=n||e.$nextTick(function(){e.$router.replace({path:"/goods"})})})}else this.$router.push({name:"goods"})}else this.$router.push({name:"goods"})}}},c=s,l=(a("ba1a"),a("2877")),u=Object(l["a"])(c,o,n,!1,null,"37cbdeed",null);u.options.__file="welcome.vue";t["default"]=u.exports}}]);