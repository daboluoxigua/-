<template>
  <div class="hello">
    <div class="userinfo" v-if="browserName==2">
      <img :src="headimgurl" alt>
      <p>{{nickname}}</p>
    </div>
    <input type="number" ref="phoneNum" min="11" max="11" placeholder="请输入手机号码" v-else>
    <button class="btn" @click="routerTo()">开始点餐</button>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
export default {
  data(){
    return {
      headimgurl:''
    }
  },
  created(){
    this.headimgurl = window.localStorage.getItem("headimgurl");
    this.nickname = window.localStorage.getItem("nickname");
    this.browserName = window.localStorage.getItem("browserName"); //1为支付宝 2为微信
  },
  methods: {
    routerTo() {
      if (this.browserName == 1) {
        let phoneNum = this.$refs.phoneNum.value;
        if (phoneNum) {
          if (!/^1[34578]\d{9}$/.test(phoneNum)) {
            alert("手机号码有误,请重填");
            return false;
          }
          axios
            .get("/public/members/getMemberInfo", {
              params: {
                appId: window.localStorage.getItem("appid"),
                storeId: window.localStorage.getItem("storeid"),
                brandId: window.localStorage.getItem("brandid"),
                account: phoneNum
              }
            })
            .then(d => {
              const data = d.data;
              if (data.content != null) {
                window.sessionStorage.setItem("phoneNum", phoneNum);
                const repastPopulation = window.localStorage.getItem(
                  "repastPopulation"
                );
                if (repastPopulation && repastPopulation != "false") {
                } else {
                  this.$router.replace({path:'/goods'})
                }
              } else {
                alert("请输入正确的会员手机号码");
                return false;
              }
            });
        }
      }
      this.$router.push({
        name: "goods"
      });
    }
  }
};
</script>

<style scoped lang="less">
@import "../../common/css/common.less";
.hello{text-align: center;padding-top: 200*@rem;
  .userinfo{width: 100%;
    img{width: 150*@rem;height: 150*@rem;border-radius: 50%}
    p{ color: #000;font-size: 32*@rem}
  }

  .btn{width: 100%;height: 80*@rem;line-height: 80*@rem; background: #ea5a49;font-size: 32*@rem;border-radius: 4*@rem; color: #fff;position:fixed;bottom: 0;left: 0;border: none;}
}
</style>
