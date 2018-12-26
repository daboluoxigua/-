<template>
  <div class="orderList">
    <div class="orderListBox" ref="orderListBox">
      <ul>
        <li v-for="(item,index) in data" :key="index" @click="orderInfo(item.refNetOrderId)">
          <div>
            <span>
              <b>{{item.itemList[0].dishName}}{{item.itemList.length > 1 ? "等菜品":''}}</b>
            </span>
          </div>
          <div>
            <span>
              <b>订单号:</b>
              {{item.refNetOrderId}}
            </span>
            <span>{{item.createdAtStr}}</span>
          </div>
          <div>
            <span>
              <b>订单状态:</b>
            </span>
            <span>{{item.paymentStatusStr}}</span>
          </div>
          <div>
            <span>
              <b>总价:</b>
              ￥{{item.total}}
            </span>
          </div>
          <div>
            <span>
              <b>实付:</b>
              ￥{{item.cost}}
            </span>
          </div>
        </li>
      </ul>
    </div>
    <button class="btn" @click="again">再来一单</button>
    <loading v-if="loading"></loading>
  </div>
</template>
<script>
import BScroll from "better-scroll";
import axios from "axios";
import qs from "qs";
import loading from "../loading/loading.vue"; //加载中
export default {
  data() {
    return {
      loading: false,
      data: {}
    };
  },
  activated() {
    this.componentDidMount();
  },
  methods: {
    componentDidMount() {
      this.loading = true;
      axios
        .post(
          "../../wx/findOrder",
          qs.stringify({
            appid: window.localStorage.getItem("appid"),
            storeid: window.localStorage.getItem("storeid"),
            openid: window.sessionStorage.getItem("openid"),
            brandid: window.localStorage.getItem("brandid")
          })
        )
        .then(d => {
          this.loading = false;
          const req = d.data;
          if (req.result == 0) {
            this.data = req.content;
            if (req.content.length > 0) {
                req.content.forEach(element => {
                    window.sessionStorage.setItem("phoneNum", element.memberPhoneNumber);
                });
                this.$nextTick(() => {
                  if (!this.scroll) {
                    this.scroll = new BScroll(this.$refs.orderListBox, {
                      click: true
                    });
                  }else{
                    this.scroll.refresh();
                  }
                });
            }
          } else {
            alert(req.errmsg);
          }
        });
    },
    again() {
      this.$router.push({ path: "/goods",query:{'time':new Date().getTime()}});
    },
    orderInfo(getorderid) {
      this.$router.push({
        path: "/orderInfo",
        query: {
          orderid: getorderid
        }
      });
    }
  },
  components: {
    loading
  }
};
</script>
<style lang="less" scoped>
.orderList {
  background: #f6f6f6;
  padding: 0 20px;
  .orderListBox {
    max-height: calc(100% - 180px);
    overflow: hidden;
    width: 100%;
    float: left;
  }
  ul {width: 100%;
      display: inline-block;
    li {
      background: #fff;
      box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
      width: 100%;
      display: inline-block;
      margin-top: 20px;
      padding: 20px;
      div {
        line-height: 30px;
        width: 100%;
        display: inline-block;
        span {
          float: left;
          color: #666;
          b {
            color: #444;
          }
        }
        span:nth-child(2) {
          float: right;
        }
      }
    }
  }

  button {
    margin: 40px 0 0;
  }
}
</style>
