<template>
  <div class="cartcontrol">
    <div v-if="food.dishCount == 0" class="shouqing">售罄</div>
    <div v-else>
      <transition name="move">
        <div class="cart-decrease" v-show="food.quantity>0" @tap.stop.prevent="decreaseCart">
          <span class="inner iconfont icon-jianhao"></span>
        </div>
      </transition>
      <div class="cart-quantity" v-show="food.quantity>0">{{food.quantity}}</div>
      <div class="cart-add iconfont icon-jiahao1 a" v-if="!food.maxitemCount" @tap.stop.prevent="addCart"></div>
      <div class="cart-add iconfont icon-jiahao1 b" v-if="(itemCount - food.maxitemCount) > 0" @tap.stop.prevent="addCart"></div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import Vue from "vue";
export default {
  props: {
    food: {
      // type: Object
    },
    itemCount:{
      default:1
    },
  },
  data() {
    return {
      stopOndblclick:1
    }
  },
  methods: {
    addCart(event) {
      if(this.stopOndblclick){
        // if (this.food.add) {
        //   if (!this.food.quantity) {
        //     Vue.set(this.food, "quantity", 1);
        //   } else {
        //     let num = this.food.quantity+1
        //     Vue.set(this.food, "quantity", num);
        //   }
        // }
        this.$emit("addFood", this.food, event.target);
        this.$emit("add", event.target);
        this.$forceUpdate()
        this.stopOndblclick++
      }
      setTimeout(()=>{
        this.stopOndblclick=1
      },20)
      
    },
    decreaseCart() {
      if(this.stopOndblclick){
        if (this.food.quantity) {
          // this.food.quantity--;
          this.$emit("DeletFood", this.food);
        }
        this.$forceUpdate()
        this.stopOndblclick++
      }
      setTimeout(()=>{
        this.stopOndblclick=1
      },10)
    }
  }
};
</script>

<style lang="less">
@import "../../common/css/common.less";
.cartcontrol {
  height: 54px;
  font-size: 0;
  .cart-decrease {
    display: inline-block;
    padding: 6 * @rem;
    opacity: 1;
    transform: translate3d(0, 0, 0);
    .inner {
      display: inline-block;
      line-height: 42 * @rem;
      font-size: 50 * @rem;
      color: rgb(0, 160, 220);
      transition: all 0.4s linear;
      transform: rotate(0);
    }
    &.move-enter-active,
    &.move-leave-active {
      transition: all 0.4s linear;
    }
    &.move-enter,
    &.move-leave-active {
      opacity: 0;
      transform: translate3d(24 * @rem, 0, 0);
      .inner {
        transform: rotate(180deg);
      }
    }
  }
  .cart-quantity {
    display: inline-block;
    vertical-align: top;
    min-width: 12 * @rem;
    padding-top: 6 * @rem;
    line-height: 42 * @rem;
    text-align: center;
    font-size: 28 * @rem;
    color: rgb(147, 153, 159);
  }
  .cart-add {
    display: inline-block;
    padding: 6 * @rem;
    line-height: 42 * @rem;
    font-size: 50 * @rem;
    color: rgb(0, 160, 220);
  }
  .shouqing{line-height: 54px; color: #000;float: left;font-size: 28px;color: #666}
}
</style>