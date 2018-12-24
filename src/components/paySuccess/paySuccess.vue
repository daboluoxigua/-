<template>
  <div class="paySuccess">
    <navTop :title="title"></navTop>
    <div class="wait" v-if="iscomplete">等待厨房接单，请您稍等，请勿随意更换座位
      <div class="spinner">
        <div class="rect1"></div>
        <div class="rect2"></div>
        <div class="rect3"></div>
        <div class="rect4"></div>
        <div class="rect5"></div>
      </div>
    </div>
    <div class="suc" v-else>
      <!-- <div class="tit">
            <img src="../../common/images/pay_success.png">
            <p>下单成功</p>
      </div>-->
      <div
        class="refuse"
      >{{this.showData.model ? "取餐号" : "餐牌号"}}：{{showData.model ? showData.content.callNumber : showData.content.tableNames}}</div>
      <div class="order-info" @click="orderInfo">
        <div class="header">订单信息</div>
        <p>单号：{{orderid}}</p>
        <p>终端单号: {{showData.content.refOrderId}}</p>
        <p>就餐方式: {{showData.content.orderTypeStr}}</p>
        <p>下单时间：{{showData.content.createdAtStr}}</p>
        <p>支付方式：{{showData.content.paymentList[0].payName}}</p>
      </div>
      <button class="btn" @click="again">再来一单</button>
    </div>
    <loading v-if="loading"></loading>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
import navTop from "../nav/navTop.vue";
import loading from "../loading/loading.vue"; //加载中
import utils from "../../common/js/utils.js";
export default {
  data() {
    return {
      loading: false,
      title: window.localStorage.getItem("welcomeSname"),
      iscomplete: true
    };
  },
  activated() {
    this.init();
  },
  methods: {
    init() {
      this.iscomplete = true;
      this.showData = {
        model: false,
        content: {
          callNumber: "",
          tableNames: "",
          paymentList: [{ payName: "" }]
        }
      };
      this.orderid = this.$route.query.orderid;
      this.onCheckDeliverd();
    },
    onCheckDeliverd() {
      const infoList = {
        appid: window.localStorage.getItem("appid"),
        storeid: parseInt(window.localStorage.getItem("storeid")),
        orderid: this.orderid
      };
      this.timer = setInterval(() => {
        axios.post("../../wx/checkDeliverd", qs.stringify(infoList)).then(d => {
          const req = d.data;
          if (req.result == 0) {
            let shoppingCart = this.shoppingCart;
            shoppingCart = {
              allprice: 0,
              allNum: 0,
              allCommodity: [],
              numerObj: {},
              kindNum: {}
            };
            if (req.content.type == "2") {
              clearInterval(this.timer); //关闭
              window.sessionStorage.setItem("orderid", this.orderid);
              this.getOrderByOrderID();
            } else if (req.content.type == "3") {
              clearInterval(this.timer);
              this.iscomplete = false;
              window.sessionStorage.setItem("orderid", this.orderid);
            }
          } else if (req.result == -1) {
            this.iscomplete = false;
            window.sessionStorage.setItem("orderid", ""); //清除缓存
          } else {
            alert(req.errmsg);
          }
        });
      }, 500);
    },
    getOrderByOrderID() {
      //获取订单信息
      this.loading = true;
      axios
        .post(
          "../../wx/getOrderByOrderID",
          qs.stringify({
            appid: window.localStorage.getItem("appid"),
            storeid: window.localStorage.getItem("storeid"),
            orderid: this.orderid
          })
        )
        .then(d => {
          this.loading = false;
          const req = d.data;
          if (req.result == 0) {
            this.showData.content = req.content;
            this.getStoreModel();
          } else {
            alert(req.errmsg);
          }
        });
    },
    getStoreModel() {
      //获取订单桌牌号等信息
      axios
        .post(
          "../../wx/getStoreConfiguration",
          qs.stringify({
            appid: window.localStorage.getItem("appid"),
            storeid: window.localStorage.getItem("storeid"),
            brandid: window.localStorage.getItem("brandid")
          })
        )
        .then(d => {
          const req = d.data;
          if (req.result == 0) {
            this.iscomplete = false;
            this.showData.model = req.data.callNumberMode;
          } else {
            alert(req.errmsg);
          }
        });
    },
    again() {
      this.$router.push({ path: "/goods" });
    },
    orderInfo() {
      this.$router.push({
        path: "/orderInfo",
        query: {
          orderid: this.$route.query.orderid
        }
      });
    }
  },
  beforeDestroy() {
    clearInterval(this.timer); //关闭
  },
  components: {
    loading,
    navTop
  }
};
</script>

<style lang="less" scoped>
.paySuccess {
  background: #f6f6f6;
  .wait {
    height: 100%;
    padding-top: 50%;
    text-align: center;
    font-size: 30px;
    color: #444;
  }
  .suc {
    text-align: center;
    padding: 0 20px;
    .tit {
      margin-top: 80px;
      img {
        width: 160px;
      }
      p {
        font-size: 48px;
        margin-top: 20px;
        color: #ff8344;
      }
    }
    .refuse {
      font-size: 60px;
      color: #ff8344;
      margin-top: 120px;
    }
    .order-info {
      background: #fff;
      text-align: left;
      margin: 60px 0 0;
      padding: 20px;
      line-height: 60px;
      box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
      .header {
        font-size: 32px;
        border-bottom: 1px solid #ddd;
      }
    }
    button {
      margin: 40px 0 0;
    }
  }
}
</style>

