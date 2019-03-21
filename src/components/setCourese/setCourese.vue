<template>
  <transition name="move">
    <div class="catconfig" v-show="showFlag">
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
            <p>
              已选：
              <span
                v-for="(items,index) in subItemList"
                :key="index"
              >{{items.dishName}} {{items.quantity > 1 ? "x" + items.quantity + items.unit : "" }} {{items.price > 0 ? "+￥" + (items.price*items.quantity).toFixed(2) : "" }} /</span>
            </p>
            <span class="price">
              ￥{{(selectFoods.cost + totalPrice).toFixed(2)}}
              <em
                v-if="showMemberPrice == 'true' && !selectFoods.abandonPrice"
              >会员价￥{{(selectFoods.memberPrice + totalPrice).toFixed(2)}}</em>
              <em v-if="selectFoods.abandonPrice">
                <del>原价￥{{(selectFoods.abandonPrice + totalPrice).toFixed(2)}}</del>
              </em>
            </span>
          </div>
        </div>
        <div class="config" ref="config">
          <div>
            <div v-for="(items,index) in selectFoods.packageItems" :key="index">
              <div class="title">
                <span
                  v-if="items.userdefinedName"
                >{{items.userdefinedName + items.itemName.substring(4,items.itemName.length)}}</span>
                <span v-else>{{items.itemName}}</span>
              </div>
              <div class="disContent" ref="disContent">
                <ul>
                  <li v-for="(optionset,index2) in items.options" :key="index2">
                    <span
                      @tap="_elect(optionset,items,index2,$event)"
                      :class="{'active': optionset.isElect}"
                    >
                    <img v-if="optionset.imageName" :src="optionset.imageName">
                    <img v-else src="../../common/images/no.png">
                    <p>{{optionset.dishName}} {{optionset.extraCost > 0 ? "+￥" + optionset.extraCost : ''}}</p>
                    </span>
                    <cartcontrol
                      @DeletFood="DeletFood"
                      @addFood="addFoodNum"
                      :food="optionset"
                      :itemCount="items.itemCount"
                      v-if="items.itemCount>1 && optionset.isElect"
                    ></cartcontrol>
                  </li>
                </ul>
              </div>
              
            </div>
          </div>
        </div>
        <div class="numconfig">
          <button class="btn" @click="addFood">加入购物车</button>
        </div>
      </div>
      <foodcustom :selectFoods="foodItems" :courese="courese" @addCustom="addOdd" ref="foodcustom"></foodcustom>
    </div>
  </transition>
</template>

<script>
import Vue from "vue";
import { Toast } from "mint-ui";
import BScroll from "better-scroll";
import cartcontrol from "../cartcontrol/cartcontrol.vue";
import foodcustom from "../foodcustom/foodcustom.vue"; //定制项

export default {
  props: {
    selectFoods: {},
    target: {}
  },
  components: {
    cartcontrol,
    foodcustom
  },
  data() {
    return {
      showMemberPrice: window.localStorage.getItem("showMemberPrice"),
      courese: true, //传值给子组件，判断是否由套餐进入
      showFlag: false,
      isElect: false,
      numconfigShow: false,
      foodItems: {},
      subItemList: [], //已选单品
      index: "",
      transmission: "",
      storageItems: "", //储存当前选中的菜品的所在列表
      storageMaxitemCount: "", //储存当前选中的菜品的所在列表最大可选
      maxitemCount: 0,
      totalPrice: 0,
      stopOndblclick:true,//防止滚动事件造成双击
    };
  },
  computed: {},
  methods: {
    show() {
      this.showFlag = true;
      this.$nextTick(() => {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.config, {
            tap: true
          });
        } else {
          this.scroll.refresh();
        }

        if (!this.disContentScroll) {
          this.$refs.disContent.forEach((item,index) =>{
            new BScroll(item, {
              scrollX: true,
              scrollY:false,
              tap: true,
            });
          })
          
        }

        this.init();
      });
    },
    hide() {
      this.totalPrice = 0;
      this.showFlag = false;
      this.$forceUpdate();
    },
    init() {
      this.index = "";
      this.storageItems = "";
      this.subItemList.splice(0, this.subItemList.length);
      this.selectFoods.packageItems.forEach(items => {
        items.options.forEach((options,index,arr) => {
            options.isElect = false;
            options.quantity = 0;
        });
        if(items.itemCount==1){
            items.options[0].isElect = true;
            items.options[0].quantity = 1;
            this.subItemList.push(items.options[0])
          };
      });
      this.defaultShow()
    },
    defaultShow(){
    },
    _elect(e, items, index,event) {
      if(this.stopOndblclick){
        this.stopOndblclick=false
        this.isElectToggle(e, items, index, "");
      }else{
        this.stopOndblclick=true
      }
      
    }, //加入到购物车
    addFood() {
      //加入购物车之前先进行必填校验
      if (!this.validator()) {
        return;
      }

      //数据加入购物车
      if (!this.selectFoods.quantity) {
        Vue.set(this.selectFoods, "quantity", 1);
      } else {
        this.selectFoods.quantity++;
      }
      Vue.set(this.selectFoods, "count", 1);
      let price = this.selectFoods.abandonPrice
        ? this.selectFoods.abandonPrice
        : this.selectFoods.price;
      
      //为了修复选择套餐内容后别的套餐内容跟着变化
      let subItemList =[]
      this.subItemList.forEach(items => {
        subItemList.push(items)
      })

      let list = {
        dishKind: this.selectFoods.dishKind,
        dishID: this.selectFoods.dishID,
        dishName: this.selectFoods.dishName,
        price: price + this.totalPrice, //原价,
        marketPrice: this.selectFoods.price + this.totalPrice,
        marketPriceCost: this.selectFoods.price + this.totalPrice, //价格可能设置错了
        cost: this.selectFoods.cost + this.totalPrice,
        takeFee: this.selectFoods.waiDai_cost, //打包费
        waimaiPrice: this.selectFoods.waimaiPrice, //外卖费
        quantity: this.selectFoods.count,
        comment: this.selectFoods.comment,
        gift: this.selectFoods.gift,
        subItemList: subItemList,
        marketList: [],
        optionList: [],
        seq: 0
      };
      this.$emit("addCustom", list, this.target);
      this.hide();
    },
    //直接添加的/定制项添加
    addOdd(e) {
      if (this.storageItems) {
        if (this.storageItems.itemCount == 1) {
          //单选
          this.storageItems.options.forEach((element, i) => {
            //再次点击当前选择的时候不赋值
            if (i == this.index) {
              element.quantity = 1;
              element.isElect = true;
            } else {
              element.quantity = 0;
              element.isElect = false;
              this.DeletFood(element); //删除单选
            }
          });
        } else {
          //多选
          if (this.transmission) {
            this.transmission.isElect = true;
          }
        }
      }

      let isPush = true;
      this.subItemList.forEach(items => {
        if (items.dishID == e.dishID) {
          isPush = false;
          // e.quantity++
        }
      });
      if (isPush) {
        e.quantity = 1;
        e.isElect = true;
        this.subItemList.push(e);
      }
      this.isMax(e); //执行完后重新计算最大可选数量
    },
    //统计已经选择
    isElectToggle(e, items, index) {
      this.index = index; //储存点击时候的索引，在弹出定制项后，在单选列表中去除其他选项
      if (this.isMax(e, items, index) == false) {
        return; //如果超过最大可选
      }

      //下面是点击菜品进入的内容 -----------------------------------------------------------------------
      //判断显示定制项
      if (e.optionCategoryList) {
        if (e.optionCategoryList.length > 0) {
          if (!e.isElect) {
            this.$refs.foodcustom.show();
            this.transmission = e; //储存点击后的菜品
            this.storageItems = items;
            this.foodItems = e; //赋值给定制项组件
          } else {
            this.transmission = "";
            e.isElect = false;
            e.quantity = 0;
            this.DeletFood(e); //删除带定制项
          }
          return false;
        } else {
          this.storageItems = "";
        }
      } else {
        this.storageItems = "";
      }
      //不弹出定制项执行下面的代码---------------------------------------------
      //单选时
      if (items.itemCount == 1) {
        items.options.forEach((element, i) => {
          //再次点击当前选择的时候不赋值
          if (i == index) {
            element.quantity = 1;
            element.isElect = true;
          } else {
            element.quantity = 0;
            element.isElect = false;
            this.DeletFood(element); //删除单选
            return false;
          }
        });
      } else {
        this.transmission = "";
        if (!e.isElect) {
          e.isElect = true;
          e.quantity = 1;
          this.$forceUpdate();
        } else {
          e.isElect = false;
          e.quantity = 0;
          this.DeletFood(e); //删除单选
          return false;
        }
      }

      this.addOdd(e);
    }, //最多可选
    isMax(e, items, index) {
      this.setTotalPrice();
      if (!items) {
        this.selectFoods.packageItems.forEach(item => {
          if (item.itemCount > 1) {
            item.options.forEach(food => {
              if (food.dishID == e.dishID) {
                items = item;
              }
            });
          }
        });
      }
      //可选最大数量
      if (items) {
        console.log(1111)
        this.maxitemCount = 0;
        items.options.forEach(element => {
          if (element.isElect) {
            this.maxitemCount += element.quantity;
          }
        });
        items.options.forEach(element => {
          Vue.set(element, "maxitemCount", this.maxitemCount);
        });

        //多选时 判断是否超过可选数
        if (!e.isElect) {
          if (items.itemCount !== 1) {
            if (this.maxitemCount == items.itemCount) {
              this.numconfigShow = false;
              console.log(this.maxitemCount,items.itemCount)
              Toast({
                className: "toasts",
                message: `这类最多只能选${items.itemCount}个哦`
              });
              return false;
            }
          }
        }
      }
    },
    addFoodNum(e) {
      this.isMax(e);
      let index;
      this.subItemList.forEach((itme, i) => {
        if (itme.dishID == e.dishID) {
          index = i; //获得相同数组的最后一个索引
        }
      });

      if (index !== undefined) {
        if (this.subItemList[index].quantity > 0) {
          this.subItemList[index].quantity++;
          e.isElect = true;
        }
        if (e.optionCategoryList) {
          if (e.optionCategoryList.length > 0) {
            e.quantity++;
          }
        }
      }
      this.$forceUpdate();
      this.isMax(e); //执行完后重新计算最大可选数量
    },
    DeletFood(e) {
      let index;
      // this.isMax(e);

      this.subItemList.forEach((itme, i) => {
        if (itme.dishID == e.dishID) {
          index = i; //获得相同数组的最后一个索引
        }
      });

      if (index !== undefined) {
        if (this.subItemList[index].quantity > 0) {
          this.subItemList[index].quantity--;
          e.quantity = this.subItemList[index].quantity;
        }
      }

      //减到0时从购物车删除
      this.subItemList.forEach((item, i) => {
        if (!item.quantity > 0) {
          console.log("已删除菜品", item.dishName);
          this.subItemList.splice(i, 1);
        }
      });

      this.selectFoods.packageItems.forEach(items => {
        items.options.forEach(e => {
          if (!e.quantity > 0) {
            e.isElect = false;
          }
        });
      });
      this.$forceUpdate();
      // this.isMax(e); //执行完后重新计算最大可选数量
    }, //计算总价
    setTotalPrice() {
      //统计价格
      let total = 0;
      this.subItemList.forEach(items => {
        total += items.quantity * (items.itemPrice > 0 ? items.itemPrice : 0);
      });
      this.totalPrice = parseFloat(total.toFixed(2));
    }, //必填项目校验
    validator() {
      let boolean = true;

      this.selectFoods.packageItems.forEach(item => {
        if (item.itemCount > 0) {
          let count = 0;
          item.options.forEach(food => {
            count += food.quantity;
          });
          if (item.itemCount > count) {
            boolean = false;
            // let string =
            Toast({
              className: "toasts",
              message: `${
                item.userdefinedName ? item.userdefinedName : item.itemName
              },此项还未选完哦~`
            });
          }
        }
      });

      if (boolean) {
        return true;
      } else {
        return false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../common/css/common.less";
.catconfig {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  left: 0;
  top: 0;
  color: #999;
  z-index: 60;
  background: rgba(0, 0, 0, 0.6);
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
    height: 100%;
    bottom: 0;
    padding: 30 * @rem;
    .back {
      line-height: 80 * @rem;
      width: 80 * @rem;
      color: #999;
      text-align: center;
      position: absolute;
      margin-top: -10px;
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
    display: flex;
    .imgbox {
      float: left;
      width: 190 * @rem;
      height: 190 * @rem;
      position: relative;
      flex: 0 0 190 * @rem;
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
      overflow: auto;
      h2 {
        color: #333;
        font-size: 36 * @rem;
      }
      p {
        margin-top: 20px;
        line-height: 35px;
        max-height: 35 * 3px;
        overflow: hidden;
      }
      .price {
        color: #f01414;
        font-size: 42px;
        display: inline-block;
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
    margin-bottom: 30px;
    margin-top: 30px;
    height: calc(100% - 420px);
    > div > div {
      .title {
        line-height: 90 * @rem;
      }
      .disContent{width: 100%;
        ul{display: inline-block;height: 280px;white-space:nowrap;}
      }
      li {
        box-sizing: content-box;
        display: inline-block;
        padding-left: 35 * @rem;
        position: relative;
        span {
          box-sizing: content-box;
          overflow: hidden;
          transition: 0.2s;
          width: 160px;
          border: 1px solid #ddd;
          border-radius: 15px;
          padding: 20px;
          // height: 70 * @rem;
          // line-height: 70 * @rem;
          display: inline-block;
          background: #f6f6f6;
          &.active {
            background: #ea5a49;
            color: #fff;
            transition: 0.2s;
          }
          img{width: 160px; height: 160px;}
          p{text-align:center;margin-top: 12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        }
        .cartcontrol {
          display: inline-block;
          vertical-align: middle;
          margin-right: 10px;
          position: absolute;
          bottom: -50px;
          left: 30%;
        }
      }
    }
  }
  .numconfig {
    width: 100%;
    text-align: center;
  }
  .basket {
    width: 100%;
    position: relative;
    line-height: 50px;
    > span {
      float: left;
    }
    .cartcontrol {
      float: right;
    }
  }
}
</style>