<template>
  <div class="addressEdit">
    <navTop :title="title"></navTop>
    <ul>
      <li>
        <span>联系人</span>
        <input type="text" placeholder="姓名" v-model="customer">
      </li>
      <li>
        <span>电话</span>
        <input type="number" min="11" max="11" placeholder="手机号码" v-model="phone">
      </li>
      <li>
        <span>地址</span>
        <input type="text" placeholder="选择收货地址" @click="mapShow" readonly v-model="mapInfo.address">
      </li>
      <li>
        <span>门牌号</span>
        <input type="text" placeholder="例：5号楼203室" v-model="detail">
      </li>
    </ul>
    <button class="btn" @click="submit">保存并使用</button>
    <tmpmap ref="map" @mapInfo="_mapInfo"></tmpmap>
    <loading v-if="loading"></loading>
  </div>
</template>
<script>
import navTop from "../nav/navTop.vue";
import tmpmap from "../map/map.vue";
import axios from "axios";
import qs from "qs";
import loading from "../loading/loading.vue"; //加载中
import {mapMutations} from 'vuex'
import { Toast } from "mint-ui";
export default {
  data() {
    return {
      title: "填写收货信息",
      loading: false,
      mapInfo: {
        address: ""
      },
      customer:'',
      phone:'',
      detail:''
    };
  },
  created() {
    if(this.$route.query.customer){
      let data = this.$route.query
      console.log(data)
      this.customer = data.customer;
      this.phone = data.phone;
      this.detail = data.detail;
      this.mapInfo = {
        address:data.address,
        location:data.xy
      };
    }
  },
  methods: {
    ...mapMutations(['set_addressInfo']),
    mapShow() {
      this.$refs.map.show();
    },
    _mapInfo(e) {
      this.mapInfo = e;
    },
    submit() {
      if(!this.customer.length>0){
        Toast({className: 'toasts',
          message: `请填写联系人姓名`
        });
        return false;
      }

      if (!/^1[34578]\d{9}$/.test(this.phone)) {
        Toast({className: 'toasts',
            message: `手机号码有误,请重填`
          });
        return false;
      }

      if(!this.mapInfo.address.length>0){
        Toast({className: 'toasts',
          message: `选择收货地址`
        });
        return false;
      }

      if(!this.detail.length>0){
        Toast({className: 'toasts',
          message: `请填写门牌号`
        });
        return false;
      }

      const dataList = {
        appid: window.localStorage.getItem("appid"),
        storeid: window.localStorage.getItem("storeid"),
        customerid: window.sessionStorage.getItem("openid"),
        customer:this.customer,   //收货人名称
        phone:this.phone,  //电话
        address:this.mapInfo.address,  //地址
        detail:this.detail,   //门牌号，详情
        xy:JSON.stringify(this.mapInfo.location),  //经纬度，坐标
        id:this.$route.query.id,  //地址信息id ，修改时必传，新增时不传
        defaultCheck:1
      };
      this.loading = true;
      axios
        .post(
          "../../wx/updateDeliverCustomerInfo",
          qs.stringify(dataList)
        )
        .then(res => {
          this.loading = false;
          if(res.data.result == 0){
            this.set_addressInfo(dataList)
            this.$router.go(-2);
          }
        });
    }
  },
  components: {
    navTop,
    tmpmap,
    loading
  }
};
</script>
<style lang="less" scoped>
.addressEdit {
  background: #f6f6f6;
  ul {
    background: #fff;
    padding: 0 30px;
    margin-top: 20px;
    li {
      height: 90px;
      line-height: 90px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 1px;
      span {
        width: 145px;
        display: inline-block;
      }
      input {
        border: none;
        width: calc(100% - 145px);
        height: 86px;
        color: #444;
      }
    }
    li:last-child {
      border: none;
    }
  }
  button {
    width: auto;
    margin: 20px;
    border-radius: 20px;
  }
}
</style>
