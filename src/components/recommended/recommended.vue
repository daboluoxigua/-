<template>
  <transition name="move">
    <div class="recommended" v-if="showFlag">
      <div class="back" @click="hide">
        <i class="iconfont icon-close2"></i>
      </div>
      <h2 class="title">{{reTxt}}</h2>
      <div class="foodbox" ref="food">
        <div>
          <div class="recommand" v-if="recommandList.length > 0">
            <ul>
              <li v-for="(item,index) in recommandList" :key="index">
                <img v-if="item.imageName" :src="item.imageName" alt>
                <img v-else src="../../common/images/no.png">
                <div class="recoInfo">
                  <div class="dishName">{{item.dishName}}</div>
                  <div class="sales">
                    <span>销量{{item.salesCount}}</span>&nbsp;
                    <span v-if="item.memberPrice">会员价￥{{item.memberPrice}}</span>
                  </div>
                  <div class="price">
                    <span>￥{{item.price}}</span>
                  </div>
                  <cartcontrol
                    @addFood="addFoodList(arguments)"
                    @DeletFood="DeletFood"
                    :food="item"
                  ></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import axios from "axios";
import qs from "qs";
import BScroll from "better-scroll";
import Vue from "vue";
import cartcontrol from "../cartcontrol/cartcontrol.vue";

export default {
  props: {
    food: {
      type: Object
    },
    data: {}
  },
  data() {
    return {
      showFlag: false,
      foodItems: {},
      optionList: [],
      recommandList: [],
      reTxt: ""
    };
  },
  methods: {
    show() {
      const getDish = {
        appId: window.localStorage.getItem("appid"),
        brandId: window.localStorage.getItem("brandid"),
        storeId: window.localStorage.getItem("storeid"),
        sourcetype: 2,
        dishtype: 2
      };
      axios
        .post("../../api/terminal/getRecommendedDish", qs.stringify(getDish))
        .then(res => {
          this.recommandList = res.data.data.dishData
        });

      this.showFlag = true;
      this.$nextTick(() => {
        //设置默认显示
        this.init();
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.food, {
            click: true
          });
        } else {
          this.scroll.refresh();
        }
      });
    },
    hide() {
      this.showFlag = false;
    },
    init() {
      this.reTxt = window.localStorage.getItem("recommend");
    },
    addFoodList(el) {
      let [food, target] = el;
      this.$emit("addFood", food, target);
    },
    DeletFood(el) {
      this.$emit("DeletFood", el);
    }
  },
  components: {
    cartcontrol
  }
};
</script>

<style lang="less" scoped>
.recommended {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 30;
  width: 100%;
  height: calc(100% - 96px);
  overflow: hidden;
  background: #fff;
  transform: translate3d(0, 0, 0);

  &.move-enter-active,
  &.move-leave-active {
    transition: all 0.2s linear;
  }

  &.move-enter,
  &.move-leave-active {
    transform: translate3d(100%, 0, 0);
  }
  .foodbox {
    height: 100%;
    overflow: hidden;
  }
  .image-header {
    position: relative;
    width: 100%;
    max-height: 562px;

    img {
      max-width: 750px;
      max-height: 562px;
    }
  }

  .back {
    line-height: 80px;
    width: 80px;
    color: #999;
    text-align: center;
    position: fixed;
    right: 10px;
    top: 10px;
    z-index: 999;
    .iconfont {
      display: block;
      font-size: 42px;
      text-shadow: 0px 0px 2px #fff;
    }
  }

  .dishInfo {
    padding: 20px;
    position: relative;
    .dishName {
      font-size: 32px;
      font-weight: bold;
    }
    .sales {
      color: #999;
      margin: 15px 0;
    }
    .price {
      span:nth-child(1) {
        color: #f01414;
        font-size: 32px;
        font-weight: bold;
        margin-right: 15px;
      }
      span:nth-child(2) {
        color: #999;
      }
    }
    .cartcontrol {
      position: absolute;
      right: 20px;
      bottom: 10px;
    }
  }

  .synopsis {
    padding: 0 20px 20px;
    color: #999;
    line-height: 32px;
  }
  .split {
    height: 20px;
    background: #f6f6f6;
  }

  .recommand {
    display: inline-block;
    padding: 20px;
    width: 100%;
    margin-bottom: 20px;
    ul {
      width: 100%;
      text-align: center;
      li {
        display: inline-block;
        width: 325px;
        border-radius: 5px;
        position: relative;
        margin-bottom: 20px;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
        img {
          width: 100%;
          height: 325px;
          margin-bottom: 20px;
        }
        .recoInfo {
          padding: 0 10px 20px;
          position: relative;
          div {
            text-align: left;
            line-height: 42px;
          }
          .dishName {
            font-size: 28px;
            height: 40px;
            overflow: hidden;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .sales {
            color: #999;
          }
          .price {
            color: #f01414;
            font-size: 32px;
            font-weight: bold;
            margin-right: 15px;
          }
          .cartcontrol {
            position: absolute;
            right: 10px;
            bottom: 0px;
            line-height: 30px;
          }
        }
      }
      li:nth-child(odd) {
        margin-right: 40px;
      }
    }
  }
  .title {
    font-size: 32px;
    line-height: 100px;
    padding-left: 40px;
  }
}
</style>