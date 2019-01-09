<template>
  <div class="hello">
    <div class="userinfo">
      <img :src="headimgurl" alt>
      <p>{{nickname}}</p>
    </div>
    <input type="number" ref="phoneNum" class='phoneNum' min="11" max="11" placeholder="请输入会员手机号码" v-if="browserName==1">
    <button class="btn" @click="routerTo()">开始点餐</button>
  </div>
</template>

<script>
import axios from "axios";
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
                let repastPopulation = window.localStorage.getItem(
                  "repastPopulation"
                );
                if (repastPopulation && repastPopulation != "false") {
                } else {
                  this.$nextTick(() => {
                    this.$router.replace({path:'/goods'})
                  });
                }
              } else {
                alert("请输入正确的会员手机号码");
                return false;
              }
            });
        }else{
          this.$router.push({
            name: "goods"
          });
        }
      }else{
        this.$router.push({
          name: "goods"
        });
      }
      
    }
  }
};
</script>

<style scoped lang="less">
@import "../../common/css/common.less";
.hello{text-align: center;padding-top: 300*@rem;
  .userinfo{width: 100%;
    img{width: 200*@rem;height: 200*@rem;border-radius: 50%}
    p{ color: #000;font-size: 32*@rem; color: #444;margin-top: 10px;}
  }
  .phoneNum{width: 80%;height: 70px;border: 2px solid #ddd;padding-left: 20px;border-radius: 5px;position: absolute;bottom: 30%;left: 50%;transform: translate(-50%, 0); }
  .btn{width: 80%;height: 80*@rem;line-height: 80*@rem; background: #ea5a49;font-size: 32*@rem;border-radius: 4*@rem; color: #fff;position:absolute;bottom: 15%;left: 50%;transform: translate(-50%, 0); border: none;}
}
</style>
