<template>
  <transition name="move">
    <div class="payPage" ref="payPage">
      <navTop :title="title"></navTop>
      <!-- <div class="nav">
        <div class="nav-left" @click="hide">
          <i class="iconfont">&#xe601;</i>
        </div>
        <h2>{{navName}}</h2>
      </div>-->
      <div class="paySrcoll" ref="paySrcoll">
        <div>
          <div class="payBox mode">
            <div class="left">就餐方式</div>
            <div class="right">
              <mt-radio v-model="switchvue" :options="modeConfig"></mt-radio>
            </div>
          </div>
          <div class="payBox" v-if="switchvue == '外卖'" @click="addressList">
            <div class="left">收货地址</div>
            <div class="right">
              <span v-if="get_addressInfo.address">{{get_addressInfo.address}}</span>
              <span v-else>选择收货地址</span>
              <em class="iconfont icon-jiantou"></em>
            </div>
          </div>
          <div class="payBox dishList">
            <ul>
              <li v-for="(item,index) in selectFoods" :key="index">
                <span class="imageName">
                  <img v-if="item.imageName" :src="item.imageName" alt>
                  <img v-else src="../../common/images/no.png" alt>
                </span>
                <span
                  class="dishName"
                  :class="{'lhcent':item.optionList.length > 0 || item.subItemList.length > 0}"
                >
                  <span>{{item.dishName}}</span>
                  <p v-if="item.optionList.length > 0">
                    <em v-for="(opt,index2) in item.optionList" :key="index2">{{opt.optionName}} /</em>
                  </p>
                  <p v-else-if="item.subItemList.length > 0">
                    <em
                      v-for="(opt,index2) in item.subItemList"
                      :key="index2"
                    >{{opt.dishName}}{{opt.quantity > 1 ? "x"+opt.quantity+opt.unit : '' }} /</em>
                  </p>
                </span>
                <span class="dishUnit">x{{item.quantity + (item.dishUnit ? item.dishUnit : '')}}</span>
                <span class="price">￥{{item.cost.toFixed(2)}}</span>
              </li>
              <li v-if="switchvue !== '堂食' && setState.takeoutFee > 0">
                <span>打包费</span>
                <span style="flex: 0 0 87%;text-align: right;">￥{{setState.takeoutFee}}</span>
              </li>
            </ul>
            <h2>
              <div class="left">小计</div>
              <div class="right">
                <span>￥{{switchvue !== '堂食' ? (Number(setState.cost) + setState.takeoutFee).toFixed(2) : setState.cost}}</span>
                <del v-if="setState.discount > 0">￥{{totalPrice.toFixed(2)}}</del>
              </div>
            </h2>
          </div>
          <div class="payBox rebate" v-if="setState.accountMember">
            <ol>
              <!-- <li class="discount">
                                <div class="left">优惠</div>
                                <div class="right"><input type="text" placeholder="请输入优惠码" v-model="couponCodeRef"><button :class="couponCode ? 'active': ''" @click="getEnterprisePlan">使用优惠码</button></div>
              </li>-->
              <li class="denoCoupon">
                <div class="left">优惠券</div>
                <div class="right" @click="couponShow">
                  {{setState.denoCoupon.word}}
                  <em class="iconfont icon-jiantou"></em>
                </div>
              </li>
              <li>
                <div class="left">积分余额{{setState.credit}},使用{{creditNum}}</div>
                <div class="right">
                  <mt-switch v-model="credit" @change="changeCredit"></mt-switch>
                </div>
              </li>
              <li>
                <div class="left">储值余额￥{{setState.balance}},使用{{balanceNum.toFixed(2)}}</div>
                <div class="right">
                  <mt-switch v-model="balance" @change="changeBalance"></mt-switch>
                </div>
              </li>
            </ol>
          </div>
          <div class="payBox remarks">
            <div class="left">订单备注</div>
            <div class="right">
              <textarea placeholder="口味、偏好等其他需求" v-model="bak" @blur="blurFun"></textarea>
            </div>
          </div>
        </div>
      </div>
      <div class="paybtn">
        <div class="left">
          <span>￥{{onSetComputer}}</span>
          <span v-if="setState.discount > 0">已优惠￥{{setState.discount}}</span>
        </div>
        <div class="right">
          <button class="pay" @click="onsubmit">{{payDesc}}</button>
        </div>
      </div>
      <coupon ref="coupon" :Order="Order.accountMember" @couponData="getcouponData"></coupon>
      <loading v-show="loading"></loading>
    </div>
  </transition>
</template>

<script>
import wx from "weixin-js-sdk";
import BScroll from "better-scroll";
import { Toast, MessageBox, Radio } from "mint-ui";
import axios from "axios";
import qs from "qs";
import coupon from "../coupon/coupon.vue";
import navTop from "../nav/navTop.vue";
import loading from "../loading/loading.vue"; //加载中
import utils from "../../common/js/utils.js";
import { mapGetters,mapMutations } from "vuex";

export default {
  props: {
    // selectFoods: {},
    // totalPrice: {}
  },
  data() {
    return {
      modeConfig:['堂食','外带'],
      screenHeight: document.body.clientHeight,
      loading: false,
      selectFoods: {},
      title: window.localStorage.getItem("welcomeSname"),
      bak: "", //备注
      couponCodeRef: "", //优惠码
      payFlag: 0, //支付按钮状态
      showFlag: false, //组件显示状态
      couponData: {}, //储存会员数据
      setState: {
        //储存会员数据
        denoCoupon: {
          word: ""
        }
      },
      switchvue: "堂食", //外带 、堂食
      credit: false, //积分状态
      creditNum: 0, //积分使用额度
      balance: false, //储值状态
      balanceNum: 0, //储值额度
      Order: {}, //储存营销方案数据
      comTotalPrice: 0, //计算应支付金额
      password: "",//储值卡密码
      browserName: window.localStorage.getItem("browserName"), //1为支付宝 2为微信
      source: this.browserName == 1 ? "支付宝" : "微信",
      openid: window.sessionStorage.getItem("openid")
        ? window.sessionStorage.getItem("openid")
        : "oNFKzv5kO0nzu4c_iza-L9yMLjvc"
    };
  },
  computed: {
    ...mapGetters(["get_selectFoods", "get_totalPrice", "get_addressInfo"]),
    payDesc() {
      if (this.payFlag == 0) {
        return "结算中";
      } else if (this.payFlag == 1) {
        return "确定支付";
      } else if (this.payFlag == 2) {
        return "订单错误";
      }
    },
    couponCode() {
      if (this.couponCodeRef.length > 0) {
        return true;
      } else {
        return false;
      }
    },
    onSetComputer(){
      this.comTotalPrice = this.setState.cost - (this.couponData.deno ? this.couponData.deno : 0); //抵扣代金券
      if(this.comTotalPrice < 0){
        this.comTotalPrice = 0
      }
      if (this.switchvue == "外带" || this.switchvue == "外卖") {
        this.comTotalPrice += this.setState.takeoutFee;
      }

      // 抵扣积分
      if (this.credit) {
        if (this.setState.credit - this.comTotalPrice <= 0) {
          this.creditNum = this.setState.credit;
        } else {
          this.creditNum = parseInt(this.comTotalPrice);
        }
        this.comTotalPrice -= this.creditNum;
      } else {
        this.creditNum = 0;
      }

      // 抵扣储值余额
      if (this.balance) {
        if (this.setState.balance - this.comTotalPrice <= 0) {
          this.balanceNum = this.setState.balance
        } else {
          this.balanceNum = this.comTotalPrice
        }

        this.comTotalPrice -= this.balanceNum;
      } else {
        this.balanceNum = 0;
      }
      this.comTotalPrice =
        this.comTotalPrice && this.comTotalPrice > 0
          ? parseInt(this.comTotalPrice.toFixed(2) * 100) / 100
          : 0;
      this.setState.realcoat = this.comTotalPrice;
      return this.comTotalPrice;
    }
  },
  watch: {
    switchvue(value) {
      if (value == "外卖" || value == "外带") {
        this.totalPrice = this.get_totalPrice+this.setState.takeoutFee
      }else{
        this.totalPrice = this.get_totalPrice;
      }
    }
  },
  activated() {
    //是否有外卖功能
    if(window.localStorage.getItem("saleOut") == 'true'){
      this.modeConfig=['堂食','外带','外卖']
    }
    this.selectFoods = this.get_selectFoods;
    this.totalPrice = this.get_totalPrice;
    this.show();
    this.getAddress();
    //没有值的时候返回到商品页
    if (!this.selectFoods.length > 0) {
      this.$router.replace({ path: "/goods",query:{'time':new Date().getTime()}});
    }
  },
  methods: {
    ...mapMutations(["set_addressInfo"]),
    show() {
      this.showFlag = true;

      this.$nextTick(() => {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.paySrcoll, {
            click: true
          });
        } else {
          this.scroll.refresh();
        }

        this.newFastFoodOrder();
      });
    },
    hide() {
      this.showFlag = false;
    },
    couponShow() {
      if (this.Order.accountMember.coupons.length > 0) {
        this.$refs.coupon.show();
      }
    },//使用积分
    changeCredit(){
      if(this.Order.trade_verify !== null){
        if(this.credit && !this.password && this.Order.accountMember.trade_verify.credit_verify) {
          MessageBox({
              $type:'prompt',
              title:null,
              message:'请输入密码',
              inputPlaceholder: '请输入密码',
              showCancelButton:true,   //不显示取消按钮
              inputType:'password',
              // inputPattern:/^[0-9]{6}$/,    //正则条件
              showInput:true
          }).then(({ value }) => {
              if (value.length > 0) {
                this.password = value;
                this.$nextTick(() => {
                  this.credit = true;
                });
                return
              }
            })
            .catch(() => {
              this.credit = false;
            });
            
            this.$nextTick(() => {
              this.credit = false;
            });
        }
      }
    },
    //使用储值卡
    changeBalance(){
      if(this.Order.trade_verify !== null){
        if(this.balance && !this.password && this.Order.accountMember.trade_verify.charge_verify) {
          MessageBox({
              $type:'prompt',
              title:null,
              message:'请输入密码',
              inputPlaceholder: '请输入密码',
              showCancelButton:true,   //不显示取消按钮
              inputType:'password',
              // inputPattern:/^[0-9]{6}$/,    //正则条件
              showInput:true
          }).then(({ value }) => {
              if (value.length > 0) {
                this.password = value;
                this.$nextTick(() => {
                  this.balance = true;
                });
                return
              }
            })
            .catch(() => {
              this.balance = false;
            });
          this.$nextTick(() => {
            this.balance = false;
          });
        }
        
      }
    },
    getcouponData(e) {
      this.couponData = e; //储存卡券信息
      this.setState.denoCoupon.word = e.title
        ? e.title
        : this.Order.accountMember.coupons.length + "张可用代金券";
    },
    newFastFoodOrder() {
      const itemList = this.selectFoods;
      const orderdata = {
        total: this.get_totalPrice, //整体价格
        member: window.localStorage.getItem("userIsMember"),
        source: this.source,
        discount: 0, //折扣率
        createdBy: 2,
        customerAmount: 1, //客户量
        subtraction: 0, //全单减0块
        orderType: 0, //食堂  或者外带
        paymentStatus: "NOT_PAYED",
        itemList: itemList //整个购物车
      };

      let datainfo = {
        appid: utils.getUrlKey("appid"),
        openid: this.openid,
        storeid: utils.getUrlKey("storeid"),
        tableid: utils.getUrlKey("table"),
        orderdata: JSON.stringify(orderdata),
        phoneModel: navigator.userAgent,
        phone: window.sessionStorage.getItem("phoneNum")
          ? window.sessionStorage.getItem("phoneNum")
          : ""
      };

      this.loading = true;
      axios.post("../../wx/newFastFoodOrder", qs.stringify(datainfo))
        .then(res => {
          this.loading = false;
          const data = res.data;
          if (data.result == 0) {
            this.payFlag = 1; //确定支付
            this.Order = res.data.content;
            this.setState = {
              isloading: false,
              paymented: data.content.paymented, //不知名参数，支付时候需要拿来判断
              id: data.content.id,
              total: data.content.total.toFixed(2), //总金额
              accountMember: data.content.accountMember, //会员信息
              enterprise: data.content.enterprise, //是否使用团餐
              discount: data.content.marketDetailStr.toFixed(2), //优惠
              cost: data.content.cost.toFixed(2), //实际支付
              realcoat: data.content.cost.toFixed(2), //减去支付方式金 额后的金额  在支付接口需要使用
              takeoutFee: data.content.takeoutFee, //外带费
              credit: data.content.accountMember ? data.content.accountMember.credit : 2, //积分
              balance: data.content.accountMember ? parseFloat((parseInt(data.content.accountMember.balance) / 100).toFixed(2)): 2, //储值
              denoCoupon: {
                word: data.content.accountMember
                  ? "你有" +
                    data.content.accountMember.coupons.length +
                    "张可用代金券"
                  : "暂无可用代金券",
                use: false,
                cost: 0,
                id: ""
              }
            };
          } else if (data.result == 1123) {
            let str = "";
            for (let i = data.content.length - 1; i >= 0; i--) {
              str += data.content[i].dishName + ",";
            }
            Toast({className: 'toasts',
              message: str + data.errmsg
            });
            setTimeout(()=>{
              this.$router.go(-1);
            },2500)
            this.payFlag = 2; //订单错误
          } else if (data.result == 1110) {
            let str = "";
            for (let i = data.content.length - 1; i >= 0; i--) {
              str += data.content[i] + ",";
            }
            Toast({className: 'toasts',
              message: str + data.errmsg
            });
            this.payFlag = 2; //订单错误
          } else {
            Toast({className: 'toasts',
              message: data.errmsg
            });
            this.payFlag = 2; //订单错误
          }
        });
    },
    onsubmit() {
      if (this.payFlag !== 1 || this.loading) {
        return false;
      }
      var _orderType = 0;//设置用餐方式
      var consumeAmount = 0;//实付价格
      var totalAmount = 0;//总价

      if(this.switchvue == "堂食"){
        _orderType = 0;
        consumeAmount = parseInt((this.setState.cost * 100).toFixed(0));
        totalAmount = parseInt((this.get_totalPrice * 100).toFixed(0));
      }else{
        consumeAmount = parseInt(((this.setState.cost+this.setState.takeoutFee) * 100).toFixed(0));
        totalAmount =  parseInt(((this.get_totalPrice + this.setState.takeoutFee) * 100).toFixed(0));
        if (this.switchvue == "外带") {
          _orderType = 1;
        }else if (this.switchvue == "外卖") {
          if (!this.get_addressInfo.id) {
            Toast({className: 'toasts',
              message: `请选择收货地址`,
            });
            return false
          }
          _orderType = 2;
        }
      }

      //基础字段
      const obj = {
        appid: utils.getUrlKey("appid"),
        storeid: utils.getUrlKey("storeid"),
        openid: this.openid,
        clientip: "192.169.1.106",
        orderid: this.Order.id, // 上一个接口的订单id
        orderType: _orderType, //0堂食 1外带 2外卖
        paymentAmount: parseInt((this.onSetComputer * 100).toFixed(0)), //实际付款的钱 单位: 分
        comment: this.bak, //备注
        bizId: new Date().getTime() //获取时间戳
      };
      obj.consumeAmount = consumeAmount; //消费金额（折扣之后）单位: 分
      obj.totalAmount = totalAmount; //总金额 单位: 分

      //会员字段
      const accountMember = this.Order.accountMember;

      //是否关注公众号
      if (window.localStorage.getItem("subscribe")) {
        obj.subscribe = window.localStorage.getItem("subscribe");
      }

      if (accountMember != null) {
        obj.uid = accountMember.uid;
        obj.memberid = accountMember.uid;
        obj.memberName = accountMember.name;
        obj.memberPhoneNumber = accountMember.phone;
        obj.cno = accountMember.uno;
        obj.denoCouponId = this.couponData.coupon_ids
          ? this.couponData.coupon_ids
          : ""; //卡券ID
        obj.products = this.couponData.products;
        obj.denoCouponCash = this.couponData.deno;
        obj.credit = this.creditNum;
        obj.balance = parseInt((this.balanceNum * 100).toFixed(0));
        obj.password = this.password;
        obj.gradeName = accountMember.gradeName;
      }

      if(_orderType == 2){
        obj.deliverCustomerInfoid = this.get_addressInfo.id; //外卖信息id
      }
      this.loading = true;
      //下面执行微信支付或者支付宝支付 browserName: 1为支付宝 2为微信
      //微信支付
      if (this.browserName == 2) {
        axios.post("../../wx/fastFoodPayOrder", qs.stringify(obj)).then(d => {
          this.loading = false;
          const data = d.data;
          const netorderid = this.Order.id;
          const _this = this;

          //提交支付

          if (data.result == 0) {
            if (
              this.setState.paymented &&
              parseFloat(this.setState.realcoat) > 0
            ) {
              wx.chooseWXPay({
                appId: data.content.appId,
                timestamp: data.content.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr: data.content.nonceStr, // 支付签名随机串，不长于 32 位
                package: data.content.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                signType: data.content.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign: data.content.paySign, // 支付签名
                success: function() {
                  sessionStorage.setItem("orderType", 1); //0 表示预点， 1表示快餐
                  if (data.content.subscribeUrl !== null) {
                    var _redirectUrl = window.location.href;
                    _redirectUrl = _redirectUrl.replace(
                      "/payPage",
                      "/PaySuccess?orderid=" + netorderid
                    );
                    _redirectUrl = encodeURIComponent(
                      _redirectUrl.replace(
                        "http://sz.canxingjian.com",
                        "http://www.smarant.com"
                      )
                    );
                    var _templateId = data.content.templateId;
                    window.location.href =
                      data.content.subscribeUrl+
                      "&redirect_url=" +
                      _redirectUrl +
                      "&reserved=" +
                      netorderid +
                      "#wechat_redirect";
                  } else {
                    _this.$router.push({
                      path: "/PaySuccess",
                      query: {
                        orderid: netorderid
                      }
                    });
                  }
                },
                cancel: function() {
                  console.log("取消支付");
                  _this.newFastFoodOrder();
                },
                fail: function() {
                  console.log("支付失败");
                  _this.newFastFoodOrder();
                }
              });
            } else {
              _this.$router.push({
                path: "/PaySuccess",
                query: {
                  orderid: netorderid
                }
              });
            }
          } else if (data.result == -8) {
            if (
              this.setState.paymented &&
              parseFloat(this.setState.realcoat) > 0
            ) {
              WeixinJSBridge.invoke(
                "getBrandWCPayRequest",
                {
                  appId: data.content.appId, //公众号名称，由商户传入
                  timeStamp: data.content.timeStamp, //时间戳，自1970 年以来的秒数
                  nonceStr: data.content.nonceStr, //随机串
                  package: data.content.package,
                  signType: data.content.signType, //微信签名方式:
                  paySign: data.content.paySign //微信签名
                },
                function(res) {
                  if (res.err_msg == "get_brand_wcpay_request:ok") {
                    sessionStorage.setItem("orderType", 1); //0 表示预点， 1表示快餐
                    _this.$router.push({
                      path: "/PaySuccess",
                      query: netorderid
                    });
                  } else if (res.err_msg == "get_brand_wcpay_request:cancel") {
                    _this.newFastFoodOrder();
                  } else {
                    _this.newFastFoodOrder();
                  }
                  // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg 将在用户支付成功后返回ok，但并不保证它绝对可靠。
                }
              );
            } else {
              this.$router.push({
                path: "/PaySuccess",
                query: {
                  orderid: netorderid
                }
              });
            }
          } else if (
            data.result == 3056 ||
            data.result == 3055 ||
            data.result == 1002
          ) {
            Toast({className: 'toasts',
              message: data.errmsg,
            });
            _this.newFastFoodOrder();
            _this.password = ""; //当密码不正确得时候，把储值密码置为空
            _this.credit=false;//使用积分状态返回
            _this.balance = false;//使用积分状态返回
          } else if (
            data.result == 1123
          ) {
            Toast({className: 'toasts',
              message: data.errmsg,
            });
            setTimeout(()=>{
              this.$router.go(-1);
            },2500)
          } else {
            Toast({className: 'toasts',
              message: data.errmsg,
            });
          }
        });
      } else if (this.browserName == 1) {
        let netorderid = this.Order.id;
        obj.userid = this.openid;
        obj.type = 3; //3为新版本
        axios
          .post("../../alipay/fastFoodPayOrder", qs.stringify(obj))
          .then(d => {
            this.loading = false;
            const _this = this;
            const req = d.data;

            if (req.result == 0) {
              //支付宝
              if (
                this.setState.paymented &&
                parseFloat(this.setState.realcoat) > 0
              ) {
                document.body.innerHTML += req.content;
                document.forms[0].submit();
              } else {
                this.$router.push({
                  path: "/PaySuccess",
                  query: {
                    orderid: netorderid
                  }
                });
              }
            }else if(req.result == -8) {
              if ( this.setState.paymented &&  parseFloat(this.setState.realcoat) > 0 ) {
                AlipayJSBridge.call(
                  "tradePay",
                  { tradeNO: req.content.tradeNO },
                  result => {
                    if (result.resultCode == "9000") {
                      this.$router.push({
                        path: "/PaySuccess",
                        query: netorderid
                      });
                    }
                    if (
                      result.resultCode == "4000" ||
                      result.resultCode == "6001" ||
                      result.resultCode == "6002"
                    ) {
                      _this.newFastFoodOrder();
                      _this.password = ""; //当密码不正确得时候，把储值密码置为空
                      _this.credit=false;//使用积分状态返回
                      _this.balance = false;//使用积分状态返回
                    }else if (result.resultCode == 1123) {
                      Toast({className: 'toasts',
                        message: result.errmsg,
                      });
                      setTimeout(()=>{
                        this.$router.go(-1);
                      },2500)
                    }
                  }
                );
              } else {
                this.$router.push({
                  path: "/PaySuccess",
                  query: {
                    orderid: netorderid
                  }
                });
              }
            }else{
              Toast({className: 'toasts',
                message: req.errmsg,
              });
              setTimeout(()=>{
                this.$router.go(-1);
              },2500)
            }
          });
      }
    },
    blurFun() {
      document.body.scrollTop = 0;
    },
    addressList() {
      this.$router.push({
        path: "/addressList"
      });
    },
    getAddress(){
      let setnull = true;
        const dataList = {
          appid: window.localStorage.getItem("appid"),
          storeid: window.localStorage.getItem("storeid"),
          customerid: window.sessionStorage.getItem("openid")
        };
        axios
          .post(
            "../../wx/getDeliverCustomerInfoByCustomerid",
            qs.stringify(dataList)
          )
          .then(res => {
            if (res.data.result == 0) {
              let list = res.data.content;
              var point = window.localStorage.getItem("point");
              if(point){
                point = point.split(",")

                if (AMap) {
                  list.forEach(item => {
                    item.xy = JSON.parse(item.xy);
                    if (item.xy instanceof Array) {
                      // 返回 p1 到 p2 间的地面距离，单位：米 设置配送范围 3000米
                      var dis = AMap.GeometryUtil.distance(point, item.xy);
                      if (dis < 3000 && item.defaultCheck == 1) {
                        this.set_addressInfo(item);
                        setnull = false;
                      }
                      if (setnull) {
                        this.set_addressInfo("");
                      }
                    }
                  });
                }
              }
            }
          });
    },

    //使用优惠码
    getEnterprisePlan() {
      if (this.couponCode) {
        axios
          .post(
            "../../public/waimai/meituan/shop/validationSetout",
            qs.stringify({
              appId: this.$route.query.appid,
              storeId: this.$route.query.storeid,
              brandId: this.$route.query.brandid,
              couponCode: this.couponCodeRef
            })
          )
          .then(d => {
            const req = d.data;
            if (!req.data) {
              Toast({className: 'toasts',
                message: "没有该优惠码，请重新输入"
              });
              this.couponCodeRef = "";
              return false;
            } else {
              var enterpriseMarket = req.data.enterpriseMarket;
              var enterpriseDiscountAmount = 0;
              if (this.setState.cost >= enterpriseMarket.minConsumption) {
                //判断是满足优惠码使用金额

                this.setState.couponCode.word = req.data.promoCode;
                if (enterpriseMarket.marketType == 0) {
                  //判断优惠方案是 打折还是直接减钱 0为打折
                  var moeny =
                    parseFloat(this.setState.cost.toFixed(2)) -
                    parseFloat(this.setState.cost.toFixed(2)) *
                      enterpriseMarket.rate;
                  enterpriseDiscountAmount = parseFloat(moeny.toFixed(2));
                } else {
                  enterpriseDiscountAmount = parseFloat(enterpriseMarket.cash);
                }

                this.setState.couponCode.model = false;
                this.setState.couponCode.cost = enterpriseDiscountAmount;
                // this.onSetComputer();
              } else {
                Toast({className: 'toasts',
                  message: "该优惠满" + enterpriseMarket.minConsumption + "可用"
                });
                this.couponCodeRef = "";
                return false;
              }
            }
          });
      } else {
        Toast({className: 'toasts',
          message: "请先输入优惠码"
        });
      }
    }
  },
  components: {
    loading,
    coupon,
    navTop
  }
};
</script>

<style lang="less" scoped>
.payPage {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 200;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f6f6f6;
  transform: translate3d(0, 0, 0);
  flex-direction: column;

  &.move-enter-active,
  &.move-leave-active {
    transition: all 0.2s linear;
  }

  &.move-enter,
  &.move-leave-active {
    transform: translate3d(100%, 0, 0);
  }

  .paySrcoll {
    width: 100%;
    max-height: calc(100% - 170px);
    position: relative;
    padding: 0 20px;
    overflow: hidden;
    .payBox {
      background: #fff;
      margin: 10px 0;
      width: 100%;
      padding: 20px;
      display: inline-block;
      box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
      .left {
        float: left;
      }
      .right {
        float: right;
      }
      .active {
        color: #409eff;
        transition: 0.2s;
      }
      .mint-switch {
        display: inline-block;
        vertical-align: middle;
        line-height: 20px;
      }
    }
    .mode {
      position: relative;
      .left {
        position: absolute;
        top: 50%;
        transform: translate(0, -50%);
      }
      span {
        padding: 0 15px;
      }
    }
    .dishList {
      ul {
        border-bottom: 1px solid #ededed;
        li {
          width: 100%;
          display: inline-block;
          padding: 8px 0;
          display: flex;
          align-items: left;
          line-height: 90px;
          .imageName {
            width: 90px;
            height: 90px;
            overflow: hidden;
            position: relative;
            float: left;
            margin-right: 20px;
            img {
              width: 100%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
          .dishName {
            margin-right: 20px;
            width: 50%;
            &.lhcent {
              line-height: 28px;
            }
            span {
              font-size: 28px;
            }
            p {
              margin-top: 10px;
              line-height: 32px;
              em {
                font-style: normal;
                color: #999;
                margin-right: 5px;
                font-size: 24px;
              }
            }
          }
          .dishUnit {
            width: 80px;
          }
          .price {
            width: 20%;
            text-align: right;
          }
        }
      }
      h2 {
        font-size: 28px;
        line-height: 60px;
        .right {
          del {
            font-weight: normal;
            margin-left: 20px;
            color: #999;
          }
        }
      }
    }
    .rebate {
      ol {
        padding-bottom: 15px;
        li {
          width: 100%;
          display: inline-block;
          padding: 8px 0;
          line-height: 48px;
        }
      }
      .discount {
        line-height: 60px;
        padding-bottom: 20px;
        border-bottom: 1px solid #ededed;
        width: 100%;
        display: inline-block;
        .left {
          font-weight: bold;
          font-size: 28px;
        }
        .right {
          width: 100%;
          input {
            width: calc(100% - 200px);
            height: 60px;
            border: none;
            float: left;
          }
          button {
            width: 160px;
            height: 50px;
            float: right;
            border: none;
            background: #999;
            color: #fff;
            &.active {
              background: #ea5a49;
            }
          }
        }
      }
    }
    .remarks {
      .left {
        font-weight: bold;
        font-size: 28px;
      }
      .right {
        width: 100%;
        textarea {
          width: 100%;
          border: 1px solid #ededed;
          background: #fafafa;
          margin-top: 20px;
          padding: 20px;
          height: 100px;
          resize: none;
          color: #444;
        }
      }
    }
  }
  .paybtn {
    width: 100%;
    height: 90px;
    line-height: 90px;
    background: #141d27;
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    position: absolute;
    bottom: 0;
    left: 0;
    .left {
      flex: 1;
      padding-left: 20px;
      span:nth-child(1) {
        color: #fff;
        font-size: 30px;
        font-weight: bold;
      }
      span:nth-child(2) {
        display: inline-block;
        vertical-align: top;
        margin-top: 26px;
        line-height: 0.512rem;
        padding-left: 0.256rem;
        margin-left: 0.256rem;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        border-left: 1px solid rgba(255, 255, 255, 0.5);
        font-size: 16px;
        font-weight: normal;
      }
    }
    .right {
      flex: 0 0 2.24rem;
      width: 2.24rem;
      .pay {
        width: 100%;
        height: 100%;
        border: none;
        background: #00b43c;
        color: #fff;
        font-size: 28px;
      }
    }
  }
  .icon-jiantou {
    color: #666;
    font-size: 18px;
  }
}
</style>
