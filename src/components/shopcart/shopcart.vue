<template>
  <div>
    <div class="shopcart">
      <div class="content" @click="toggleList">
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{'highlight':totalCount>0}">
              <i class="iconfont icon-gouwuche2" :class="{'highlight':totalCount>0}"></i>
            </div>
            <div class="num" v-show="totalCount>0">{{totalCount}}</div>
          </div>
          <div class="price" :class="{'highlight':totalPrice>0}">￥{{totalPrice}}</div>
          <!-- <div class="desc">另需配送费￥{{deliveryPrice}}元</div> -->
        </div>
        <div class="content-right" @click.stop.prevent="pay">
          <div class="pay" :class="payClass">
            {{payDesc}}
          </div>
        </div>
      </div>
      <div class="ball-container">
        <div v-for="(ball,index) in balls" :key="index">
          <transition name="drop" @before-enter="beforeDrop" @enter="dropping" @after-enter="afterDrop">
            <div class="ball" v-show="ball.show">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>
      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <div class="list-content" ref="listContent">
            <ul>
              <li class="food" v-for="(food,index) in selectFoods" :key="index">
                <span class="name">{{food.dishName}}</span>
                <div class="price">
                  <span>￥{{parseFloat((food.cost*food.quantity).toFixed(2))}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol @add="addFood" @addFood="addFoodList" @DeletFood="DeletFood" :food="food"></cartcontrol>
                </div>
                <div class="option">
                    <span v-for="(list,index2) in food.optionList" :key="index2" v-if="food.optionList">
                      {{list.optionName}} <em v-if="list.cost>0">(+￥{{list.cost}})</em>; 
                    </span>
                    <span v-if="food.subItemList" v-for="(list,index2) in food.subItemList" :key="index2">
                      {{list.dishName}} <em v-if="list.quantity > 1">{{list.quantity}} X {{list.unit}}</em> <em v-if="list.price>0">(+￥{{list.price}})</em>; 
                    </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div class="list-mask" @click="hideList" v-show="listShow"></div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
  import store from "./../../vuex/store.js";
  import BScroll from 'better-scroll';
  import math  from 'mathjs';
  import cartcontrol from '../cartcontrol/cartcontrol.vue';
  import {mapMutations} from 'vuex'
  export default {
    props: {
      data:{},
      selectFoods: {
        type: Array,
        default() {
          return [
            {
              price: 10,
              count: 1
            }
          ];
        }
      },
      deliveryPrice: {
        type: Number,
        default: 0
      },
      minPrice: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        balls: [
          {show: false},
          {show: false},
          {show: false},
          {show: false},
          {show: false}
        ],
        dropBalls: [],
        fold: true,
        first:true,
      };
    },
    computed: {
      totalPrice() {
        let total = 0;
        this.selectFoods.forEach((food) => {
          total += food.cost * food.quantity;
        });
        total = parseFloat(total.toFixed(2))
        this.set_totalPrice(total)
        return total;
      },
      totalCount() {
        let count = 0;
        this.selectFoods.forEach((food,i) => {
          if(!food.quantity > 0){
            // this.selectFoods.splice(i,1)
          }else{
            count += food.quantity;
          }
          
        });
        return count;
      },
      payDesc() {
        if (this.selectFoods.length === 0) {
          return `未选购`;
        } else {
          return '去结算';
        }
      },
      payClass() {
        if (this.totalPrice < this.minPrice) {
          return 'not-enough';
        } else {
          return 'enough';
        }
      },
      listShow() {
        if (!this.totalCount) {
          this.fold = true;
          return false;
        }
        let show = !this.fold;
        if (show) {
          this.$nextTick(() => {
            if (!this.scroll) {
              this.scroll = new BScroll(this.$refs.listContent, {
                click: true
              });
            } else {
              this.scroll.refresh();
            }
          });
        }
        return show;
      }
    },
    methods: {
      ...mapMutations(['set_selectFoods','set_totalPrice']),
      drop(el) {
        for (let i = 0; i < this.balls.length; i++) {
          let ball = this.balls[i];
          if (!ball.show) {
            ball.show = true;
            ball.el = el;
            this.dropBalls.push(ball);
            return;
          }
        }
      },
      toggleList() {
        if (!this.totalCount) {
          return;
        }
        this.fold = !this.fold;
      },
      hideList() {
        this.fold = true;
      },
      empty() {
        this.selectFoods.splice(0,this.selectFoods.length)
        //同步原始数据
        this.data.forEach(item => {
          item.dishData.forEach((item2,i) => {
            if(item2.quantity>0){
              item2.quantity=0
            }
          })
        })

        this.$forceUpdate();
      },
      pay() {
        
        if (this.selectFoods.length === 0) {
          return;
        }

        //判断是否显示推荐
        if(window.localStorage.getItem("isPayRecommended") == 1 && this.first){
          this.$emit('getReco','true');
          this.first=false;
          return
        }

        this.set_selectFoods(this.selectFoods)
        this.$router.push({
          name: 'payPage',
          query:this.$route.query
        })
      },
      addFoodList(e){
        //同步原始数据
        this.data.forEach(item => {
          item.dishData.forEach((item2, i) => {
            if (item2.dishID == e.dishID) {
              item2.quantity++;
            }
          });
        });
      },
      addFood(target) {
        this.drop(target);
        
      },
      beforeDrop(el) {
        let count = this.balls.length;
        while (count--) {
          let ball = this.balls[count];
          if (ball.show) {
            let rect = ball.el.getBoundingClientRect();
            let x = rect.left - 62;
            let y = -(window.innerHeight - rect.top - 42);
            el.style.display = '';
            el.style.webkitTransform = `translate3d(0,${y}px,0)`;
            el.style.transform = `translate3d(0,${y}px,0)`;
            let inner = el.getElementsByClassName('inner-hook')[0];
            inner.style.webkitTransform = `translate3d(${x}px,0,0)`;
            inner.style.transform = `translate3d(${x}px,0,0)`;
          }
        }
      },
      dropping(el, done) {
        /* eslint-disable no-unused-vars */
        let rf = el.offsetHeight;
        this.$nextTick(() => {
          el.style.webkitTransform = 'translate3d(0,0,0)';
          el.style.transform = 'translate3d(0,0,0)';
          let inner = el.getElementsByClassName('inner-hook')[0];
          inner.style.webkitTransform = 'translate3d(0,0,0)';
          inner.style.transform = 'translate3d(0,0,0)';
          el.addEventListener('transitionend', done);
        });
      },
      afterDrop(el) {
        let ball = this.dropBalls.shift();
        if (ball) {
          ball.show = false;
          el.style.display = 'none';
        }
      },
      DeletFood(e){
        //同步原始数据
        this.data.forEach(item => {
          item.dishData.forEach((item2,i) => {
            if(item2.dishID == e.dishID){
              item2.quantity--
              e.quantity--
            }
          })
        })


        this.selectFoods.forEach((item,i,arr)=>{
          if(!item.quantity >0){
            this.selectFoods.splice(i,1)
          }
        })

      }
    },
    components: {
      cartcontrol
    }
  };
</script>

<style lang="stylus" scoped>
  $rem=640/750/40rem;
  .shopcart
    position: fixed
    left: 0
    bottom: 0
    z-index: 120
    width: 100%
    height:90px
    .content
      display: flex
      background: #141d27
      font-size: 0
      color: rgba(255, 255, 255, 0.4)
      .content-left
        flex: 1
        .logo-wrapper
          display: inline-block
          vertical-align: top
          position: relative
          top: -10*1*$rem
          margin: 0 12*1*$rem
          padding: 6*1*$rem
          width: 60*1*$rem
          height: 60*1*$rem
          box-sizing: border-box
          border-radius: 50%
          background: #141d27
          .logo
            width: 100%
            height: 100%
            border-radius: 50%
            text-align: center
            background: #2b343c
            &.highlight
              background: rgb(0, 160, 220)
            i
              line-height: 44*1*$rem
              font-size: 24*1*$rem
              color: #80858a
              &.highlight
                color: #fff
          .num
            position: absolute
            top: 0
            right: 0
            width: 24*1*$rem
            height: 16*1*$rem
            line-height: 16*1*$rem
            text-align: center
            border-radius: 16*1*$rem
            font-size: 9*1*$rem
            font-weight: 700
            color: #fff
            background: rgb(240, 20, 20)
            box-shadow: 0 4*1*$rem 8*1*$rem 0 rgba(0, 0, 0, 0.4)
        .price
          display: inline-block
          vertical-align: top
          line-height: 90px
          box-sizing: border-box
          font-size: 32px
          font-weight: 700
          &.highlight
            color: #fff
        .desc
          display: inline-block
          vertical-align: top
          margin: 12*1*$rem 0 0 12*1*$rem
          line-height: 24*1*$rem
          font-size: 12*1*$rem
      .content-right
        flex: 0 0 105*1*$rem
        width: 105*1*$rem
        .pay
          height: 90px
          line-height: 90px
          text-align: center
          font-size: 28px
          font-weight:normal
          &.not-enough
            background: #2b333b
          &.enough
            background: #00b43c
            color: #fff
    .ball-container
      .ball
        position: fixed
        left: 68*1*$rem
        bottom: 30*1*$rem
        z-index: 200
        transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
        .inner
          width: 38px
          height: 38px
          border-radius: 50%
          background: rgb(0, 160, 220)
          transition: all 0.4s linear
    .shopcart-list
      position: absolute
      left: 0
      top: 0
      z-index: -1
      width: 100%
      transform: translate3d(0, -100%, 0)
      &.fold-enter-active, &.fold-leave-active
        transition: all 0.5s
      &.fold-enter, &.fold-leave-active
        transform: translate3d(0, 0, 0)
      .list-header
        height: 40*1*$rem
        line-height: 40*1*$rem
        padding: 0 18*1*$rem
        background: #f3f5f7
        border-bottom: 1*1*$rem solid rgba(7, 17, 27, 0.1)
        .title
          float: left
          font-size: 14*1*$rem
          color: rgb(7, 17, 27)
        .empty
          float: right
          font-size: 12*1*$rem
          color: rgb(0, 160, 220)

      .list-content
        padding: 0 18*1*$rem
        max-height: 267*1*$rem
        overflow: hidden
        background: #fff
        .food
          position: relative
          padding: 12*1*$rem 0
          box-sizing: border-box
          border-bottom:rgba(7, 17, 27, 0.1)
          .name
            line-height: 24*1*$rem
            font-size: 14*1*$rem
            color: rgb(7, 17, 27)
          .price
            position: absolute
            right: 90*1*$rem
            top:50%
            transform :translate(0,-50%)
            line-height: 24*1*$rem
            font-size: 14*1*$rem
            font-weight: 700
            color: rgb(240, 20, 20)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            top:50%
            transform :translate(0,-50%)


  .list-mask
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    z-index: 110
    backdrop-filter: blur(10*1*$rem)
    opacity: 1
    background: rgba(7, 17, 27, 0.6)
    &.fade-enter-active, &.fade-leave-active
      transition: all 0.5s
    &.fade-enter, &.fade-leave-active
      opacity: 0
      background: rgba(7, 17, 27, 0)

  .option
    width:calc(100% - 260px)
    color:#999
    line-height :30px
    span
      em
        font-style :normal
</style>