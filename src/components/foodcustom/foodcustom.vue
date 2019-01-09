<template>
    <transition name="move">
        <div class="foodcustom" v-show='showFlag'>
            <div class="food-content">
              <div class="back" @click="hide">
                    <i class="iconfont icon-close2"></i>
                </div>
                <div class="image-header">
                  <div class="imgbox">
                      <img v-if="selectFoods.imageName" :src="selectFoods.imageName">
                      <img v-else src="../../common/images/no.png">
                  </div>
                  <div class="info">
                    <h2>{{selectFoods.dishName}}</h2>
                    <p v-show="selectedCustom">已选：{{selectedCustom}}</p>
                    <span>
                      <article v-if="selectFoods.price + totalPrice > 0">￥{{(selectFoods.price + totalPrice).toFixed(2)}}</article>
                      <em v-show="selectFoods.memberPrice && selectFoods.memberPrice + totalMemberPrice > 0 && showMemberPrice == 'true' && !selectFoods.abandonPrice">会员价￥{{(selectFoods.memberPrice + totalPrice).toFixed(2)}}</em>
                      <em v-if="selectFoods.abandonPrice"><del>原价￥{{(selectFoods.abandonPrice + totalPrice).toFixed(2)}}</del></em>
                    </span>
                  </div>
                </div>
                <div class="config" ref="configcustom">
                  <div>
                    <div v-for="(items,index) in selectFoods.optionCategoryList" :key="index">
                      <div class="title">
                        {{items.optionCategoryName}} 
                        <span v-if="items.minimalOptions > 0">必选 <span v-if="items.minimalOptions > 1">(至少选择{{items.minimalOptions}}项)</span></span> 
                        <span v-if="items.optionList.length > items.maximalOptions && items.minimalOptions !== 1"> (最多可选{{items.maximalOptions}}项)</span> 
                      </div>
                      <ul>
                        <li v-for="(optionset,index2) in items.optionList" :key="index2" @click="_elect(optionset,items,index2)" :class="{'active': optionset.isElect}">
                          {{optionset.optionName}} {{optionset.price > 0 ?  " +￥" + optionset.price : ''}}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="numconfig">
                    <button class="btn" @click="addFood">{{showTxt}}</button>
                </div>
            </div>
            <div class="list-mask" @click="hide"></div>
        </div>
    </transition>
</template>

<script>
import Vue from "vue";
import { Toast } from "mint-ui";
import BScroll from "better-scroll";

export default {
  props: {
    selectFoods: {},
    courese:{},
    target:{}
  },
  data() {
    return {
      showMemberPrice: window.localStorage.getItem("showMemberPrice"),
      showFlag:false,
      isElect: false,
      food: {},
      numconfigShow: false,
      current: "",
      totalPrice:0,//统计加价
      selectedCustom:'',
      totalMemberPrice:0
    };
  },
  computed: {
    CshowFlag() {
      this.selectFoods.quantity; //这个不能删
    },
    showTxt(){
      if(this.courese == true){
        return '加入套餐'
      }else{
        return '加入购物车'
      }
    }
  },
  methods: {
    show(){
      this.showFlag = true;
      this.$nextTick(() => {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.configcustom, {
            click: true
          });
        } else {
          this.scroll.refresh();
        }
        //设置默认显示
        this.defaultShow()
      });
    },
    hide() {
      this.showFlag = false;
      this.$forceUpdate();
    },
    _elect(e, items, index) {
      e.isElect = !e.isElect; //设置选中
      //可选最大数量
      let maxitemCount = 0;
      items.optionList.forEach(element => {
        if (element.isElect) {
          maxitemCount++;
        }
      });

      //单选时
      if (items.maximalOptions == 1) {
        items.optionList.forEach((element, i, arr) => {
          element.isElect = false;
          //再次点击当前选择的时候不赋值
          if (i === index) {
            if (arr[index].quantity <= 1) {
              Vue.set(arr[index], "quantity", 1);
            }
          } else {
            Vue.set(arr[i], "quantity", 0);
          }
        });
        e.isElect = true;
        Vue.set(e, "quantity", 1);
      } else {
        //多选时
        if (maxitemCount > items.maximalOptions) {
          Toast({className: 'toasts',
            message: `这类最多只能选${items.maximalOptions}个哦`
          });
          e.isElect = !e.isElect;
          return
        }
        if(e.quantity == 1){
            Vue.set(e, "quantity", 0);
          }else{
            Vue.set(e, "quantity", 1);
          }
        this.numconfigShow = true;
      }

      
      this.current = e.dishName; //显示当前所选菜品
      this.food = e;//将当前数据传给按钮组件
      this.Selected()
    },
    addFood(){
      //加入购物车之前先进行必填校验
      if(!this.validator()){
        return
      }

      if (!this.selectFoods.quantity) {
        Vue.set(this.selectFoods, 'quantity', 1);
      } else {
        let num = this.selectFoods.quantity+1
        Vue.set(this.selectFoods, "quantity", num);
      }
      Vue.set(this.selectFoods, 'count', 1);
      let optionList = []
      if (this.selectFoods.optionCategoryList) {
        this.selectFoods.optionCategoryList.forEach(items => {
          items.optionList.forEach((e, i, a) => {
            if (e.isElect) {
              optionList.push({
                "id":a[i].id,
                "optionName":a[i].optionName,
                "price":a[i].price,
                "required":a[i].required,
                "categoryId":a[i].categoryId
              })
            }
          });
        });
      }
      this.selectFoods.itemPrice = this.selectFoods.itemPrice ? this.selectFoods.itemPrice : 0
      
      let price = price =>{
        if(this.selectFoods.abandonPrice){
          return this.selectFoods.abandonPrice
        }else{
          return this.selectFoods.price ? this.selectFoods.price : 0
        }
      }
      let list = {
          "dishKind":this.selectFoods.dishKind,
          "dishID":this.selectFoods.dishID,
          "dishName":this.selectFoods.dishName,
          "price":price(),//原价
          "marketPrice":this.totalPrice + this.selectFoods.itemPrice,
          "marketPriceCost":this.totalPrice + this.selectFoods.itemPrice,//价格可能设置错了
          "itemPrice":this.selectFoods.itemPrice+this.totalPrice,
          "cost":this.selectFoods.cost + this.totalPrice,
          "waimaiPrice":this.selectFoods.waimaiPrice,//外卖费
          "takeFee":this.selectFoods.waiDai_cost,//打包费
          "quantity":this.selectFoods.count,
          "comment":this.selectFoods.comment,
          "gift":this.selectFoods.gift,
          "subItemList":[],
          "marketList":[],
          "unit":this.selectFoods.unit,
          "dishUnit":this.selectFoods.dishUnit,
          "optionList":optionList,
          "imageName":this.selectFoods.imageName,
          "seq":0
        }
        console.log(list)
      this.$emit('addCustom', list,this.target);
      this.hide();
    },
    defaultShow(){
      this.Selected()
    },
    Selected() {
      //统计选择了的配置
      let had = "";
      if (this.selectFoods.optionCategoryList) {
        this.selectFoods.optionCategoryList.forEach(items => {
          let index = 0;
          items.optionList.forEach((e, i, a) => {
            if(items.maximalOptions == 1){//判断是否单选
              if (!e.isElect) {
                index++
                if(index == a.length){
                  a[0].isElect=true
                  Vue.set(a[0], "quantity", 1);
                }
              }
            }
            if (e.isElect) {
              had += " " + a[i].optionName + " /";
            }
          });
        });
      }

      let total = 0;
      if (this.selectFoods.optionCategoryList) {
        this.selectFoods.optionCategoryList.forEach(items => {
          items.optionList.forEach((e, i, a) => {
            if (e.isElect) {
              total += (e.quantity > 0 ? e.quantity : 0) * (e.price > 0 ? e.price : 0);
            }
          });
        });
      }

      this.totalPrice = parseFloat(total.toFixed(2))//设置加价
      // this.totalMemberPrice = parseFloat((this.selectFoods.memberPrice + total).toFixed(2))
      
      this.selectedCustom = had.slice(0, had.length - 1);
      this.$forceUpdate();
    },
    validator(){
       let boolean = true;

        this.selectFoods.optionCategoryList.forEach(item => {
            let count = 0
            item.optionList.forEach(food => {
                count += food.quantity ? food.quantity : 0
            });
            if(item.minimalOptions > count){
              boolean = false
              Toast({className: 'toasts',
                message: `${item.optionCategoryName},此项还未选完哦~`
              });
            }
        });
        if(boolean){
          return true
        }else{
          return false
        }

    }
  }
};
</script>

<style lang="less" scoped>
@import "../../common/css/common.less";
.foodcustom {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  color: #999;
  z-index: 80;
  &.move-enter-active,
  &.move-leave-active {
    transition: all 0.1s linear;
  }

  &.move-enter,
  &.move-leave-active {
    transform: translate3d(0, 100%, 0);
  }

  .food-content {
    position: absolute;
    background: #fff;
    width: 100%;
    height: 80%;
    bottom: 0;
    padding: 30 * @rem;
    z-index: 50;
    .back {
      line-height: 80 * @rem;
      width: 80 * @rem;
      color: #999;
      text-align: center;
      position: absolute;
      margin-top: -20px;
      right: 10px;
      z-index: 999;
      i {
        font-size: 42 * @rem;
      }
    }
  }

  .image-header {
    width: 100%;
    position: relative;
    .imgbox {
      float: left;
      width: 190 * @rem;
      height: 190 * @rem;
      position: relative;
      // border: 1px solid #999;
      margin-right: 20 * @rem;
      img {
        max-height: 100%;
        max-width: 100%;
      }
    }
    .info {
      height: 190 * @rem;
      position: relative;
      h2 {
        color: #333;
        font-size: 36 * @rem;
        overflow: hidden;
        line-height: 36px;
        height: 36px;
      }
      p {
        margin-top: 20px;
      }
      span {
        color: #f01414;
        font-size: 42px;
        margin-top: 20px;
        display: inline-block;
        article{
          display: inline;margin-right: 10px;
        }
        em {
          font-style: normal;
          font-size: 28px;
          color: #999;
        }
      }
    }
  }

  .config {
    width: 100%;
    display: inline-block;
    overflow: hidden;
    position: relative;
    margin-top: 30px;
    margin-bottom: 30px;
    height: calc(100% - 420px);
    > div > div {
      .title {
        line-height: 90 * @rem;
      }
      li {
        transition: 0.2s;
        height: 70 * @rem;
        line-height: 70 * @rem;
        display: inline-block;
        padding: 0 35 * @rem;
        background: #f6f6f6;
        margin-right: 25 * @rem;
        margin-bottom: 25 * @rem;
        border-radius: 5 * @rem;
        &.active {
          background: #d2ebff;
          color: #438caf;
          transition: 0.2s;
        }
      }
    }
  }
  .numconfig {width: 100%;text-align:center;
    
  }

  .list-mask{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 20;
    background: rgba(7, 17, 27, 0.6);
    &.fade-enter-active, &.fade-leave-active{
      transition: all 0.5s;}
    &.fade-enter, &.fade-leave-active{
      opacity: 0;
      background: rgba(7, 17, 27, 0);
      }
  }
}
</style>