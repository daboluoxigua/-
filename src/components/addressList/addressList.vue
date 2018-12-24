<template>
  <div class="addressList">
    <div class="nav">
      <div class="nav-left" @click="routerback">
        <i class="iconfont">&#xe601;</i>
      </div>
      <h2>选择收货地址</h2>
      <div class="add" @click="addEdit('add')">新增地址</div>
    </div>
    <div class="list" ref="list">
      <div class="roll">
        <div v-if="available.length>0">
          <ul>
            <li v-if="item" v-for="(item,index) in available" :key="index" @click="addSet(item)">
              <div class="address">{{item.address}}</div>
              <div class="detailed">{{item.detail}}</div>
              <div class="name">{{item.customer}} {{item.phone}}</div>
              <div class="icon-edit-1-copy iconfont edit" @click.stop="addEdit(item)"></div>
              <div class="icon-shanchu iconfont del" @click.stop="del(item.id)"></div>
            </li>
          </ul>
        </div>
        <div class="split" v-if="beyond.length>0"></div>
        <div class="beyond" v-if="beyond.length>0">
          <h2>以下地址超出配送范围</h2>
          <ul>
            <li v-if="item" v-for="(item,index) in beyond" :key="index">
              <div class="address">{{item.address}}</div>
              <div class="detailed">{{item.detail}}</div>
              <div class="name">{{item.customer}} {{item.phone}}</div>
              <div class="icon-edit-1-copy iconfont edit" @click="addEdit(item)"></div>
              <div class="icon-shanchu iconfont del" @click="del(item.id)"></div>
            </li>
          </ul>
        </div>
        <div
          @click="addEdit('add')"
          class="addnew"
          v-if="!beyond.length>0 && !available.length>0"
        >请添加收货地址</div>
      </div>
    </div>
    <el-amap class="amap"></el-amap>
    <loading v-show="loading"></loading>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
import BScroll from "better-scroll";
import loading from "../loading/loading.vue"; //加载中
import {mapMutations} from 'vuex'
export default {
  data() {
    const self = this;
    return {
      loading: false,
      available: [],
      beyond: []
    };
  },
  activated() {
    this.getList()
    this.$nextTick(() => {
      if (!this.scroll) {
        this.scroll = new BScroll(this.$refs.list, {
          click: true
        });
      } else {
        this.scroll.refresh();
      }
    });
  },
  methods: {
    ...mapMutations(['set_addressInfo']),
    routerback() {
      if (window.history.length <= 1) {
        this.$router.push({ path: "/" });
        return false;
      } else {
        this.$router.go(-1);
        return false;
      }
      //如果上面都执行了 页面都跳走了，这个也就不用管了
      setTimeout(() => {
        this.$router.push({ path: "/" });
      }, 500);
    },
    getList() {
      this.available = [];
      this.beyond = [];
      const dataList = {
        appid: window.localStorage.getItem("appid"),
        storeid: window.localStorage.getItem("storeid"),
        customerid: window.sessionStorage.getItem("openid")
      };
      this.loading = true;
      axios
        .post(
          "../../wx/getDeliverCustomerInfoByCustomerid",
          qs.stringify(dataList)
        )
        .then(res => {
          this.loading = false;
          if (res.data.result == 0) {
            let list = res.data.content;
            var point = window.localStorage.getItem("point").split(",");
            if (AMap) {
              list.forEach(item => {
                item.xy = JSON.parse(item.xy);
                if (item.xy instanceof Array) {
                  // 返回 p1 到 p2 间的地面距离，单位：米 设置配送范围 3000米
                  var dis = AMap.GeometryUtil.distance(point, item.xy);
                  if (dis < 3000) {
                    this.available.push(item);
                  } else {
                    this.beyond.push(item);
                  }
                }
              });
            }
          }
        });
    },
    addEdit(item) {
      this.$router.push({ path: "/addressEdit", query:item });
    },
    del(id) {
      const dataList = {
        appid: window.localStorage.getItem("appid"),
        storeid: window.localStorage.getItem("storeid"),
        customerid: window.sessionStorage.getItem("openid"),
        id: id //地址信息id
      };
      axios
        .post("../../wx/deleteDeliverCustomerInfo", qs.stringify(dataList))
        .then(() => {
          this.getList()
        });
    },
    addSet(item){
      this.update(item)//更新选中的地址
      this.set_addressInfo(item)//赋值vuex
      this.$router.go(-1);
    },
    update(item){
      item.defaultCheck=1;
      item.xy=JSON.stringify(item.xy);
      axios
        .post("../../wx/updateDeliverCustomerInfo",qs.stringify(item))
    }
  },
  components: {
    loading
  }
};
</script>

<style lang="less" scoped>
.amap {
  display: none;
}
.addressList {
  .nav .add {
    position: absolute;
    color: #fff;
    right: 20px;
    top: 0;
  }
  .list {
    height: calc(100% - 120px);
    overflow: hidden;
    margin: 20px 0;
    h2 {
      font-size: 28px;
      margin: 30px;
    }
    ul {
      padding: 0 60px;
      li {
        position: relative;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
        .address {
          font-size: 28px;
          font-weight: 700;
          padding: 15px 100px 15px 0;
        }
        .detailed {
          padding: 10px 100px 10px 0;
        }
        .name {
          line-height: 40px;
          color: #999;
        }
        .edit {
          position: absolute;
          right: 30px;
          top: 20px;
          font-size: 42px;
          color: #666;
          padding: 20px;
        }
        .del {
          position: absolute;
          right: -40px;
          top: 20px;
          font-size: 42px;
          color: #666;
          padding: 20px;
        }
      }
      li:last-child {
        border: none;
      }
    }
    .beyond {
      ul li {
        .address,
        .detailed,
        .name {
          color: #999;
        }
      }
    }
  }
}
.addnew {
  width: 100%;
  text-align: center;
  height: 400px;
  line-height: 400px;
  font-size: 42px;
  color: #666;
}
.split {
  height: 20px;
  background: #f6f6f6;
}
</style>
