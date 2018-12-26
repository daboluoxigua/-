<template>
  <div class="_map" v-show="showFlag">
    <div class="nav">
      <div class="nav-left" @click="routerback">
        <i class="iconfont">&#xe601;</i>
      </div>
      <h2>{{title}}</h2>
    </div>
    <div class="amap-page-container">
      <el-amap-search-box
        class="search-box"
        :search-option="searchOption"
        :on-search-result="onSearchResult"
      ></el-amap-search-box>
      <el-amap
        ref="map"
        vid="amapDemo"
        :plugin="plugin"
        :zoom="zoom"
        :center="center"
        class="amap-demo"
        :events="events"
      >
        <el-amap-marker
          vid="component-marker"
          :position="makerConf.position"
          :content="makerConf.content"
        ></el-amap-marker>
      </el-amap>
    </div>
    <div class="adrs" ref="adrs">
      <ul>
        <li
          class
          v-for="(item,index) in list"
          :key="index"
          :class="currIndex == index ? 'active':''"
          @click="select(item,index)"
        >
          <span class="iconfont" v-if="currIndex == index">
            <img src="https://webapi.amap.com/theme/v1.3/markers/b/mark_bs.png" alt>
          </span>
          <span class="iconfont icon-quanzi" v-else></span>
          <p class="address">{{item.address}}</p>
          <p class="address">{{item.name}}</p>
        </li>
      </ul>
    </div>
  </div>
</template>


<script>
import BScroll from "better-scroll";

export default {
  data() {
    var me = this;
    me.city = me.city || "深圳";
    return {
      showFlag: false,
      title: "确认收货地址",
      list: [],
      Search: "深圳",
      currIndex: 0,
      zoom: 16,
      center: [114.076261, 22.545037],
      lng: 0,
      lat: 0,
      events: {
        init: o => {
          o.setCity(me.city, result => {
            if (result && result.length > 0) {
              console.log(me.zoom)
              me.zoom = 16;
              me.makerConf.position = result;
              me.getList(result);
            }
          });
          //去掉logo 版本号
          document.getElementsByClassName("amap-logo")[0].style.display =
            "none";
          document.getElementsByClassName(
            "amap-copyright"
          )[0].style.visibility = "hidden";
        },
        movestart: function() {
          document.getElementsByClassName("amap-icon")[0].style.top = "-10px";
        },
        mapmove: function() {
          var point = this.getCenter();
          me.makerConf.position = [point.lng, point.lat];
        },
        moveend: function(e) {
          var point = this.getCenter();
          var pos = [point.lng, point.lat];
          me.makerConf.position = [point.lng, point.lat];
          document.getElementsByClassName("amap-icon")[0].style.top = "0";
          me.getList(pos);
        }
      },
      makerConf: {
        position: [114.076261, 22.545037],
        content: ""
      },
      searchOption: {
        city: me.city,
        citylimit: true
      },
      plugin: [
        {
          pName: "Geolocation",
          events: {
            init(o) {
              o.getCurrentPosition((status, result) => {
                console.log(result)
                if (result && result.position) {
                  me.zoom = 17;
                  me.lng = result.position.lng;
                  me.lat = result.position.lat;
                  me.center = [me.lng, me.lat];
                  me.$nextTick();
                }
              });
            },
            complete: function(result) {
              console.log(result)
              //定位成功
              var address = result.formattedAddress;
              var point = result.position;
              var obj = {
                address: address,
                name: "",
                location: point
              };
              me.list = [obj];
              me.makerConf.position = [point.lng, point.lat];
            },
            error: function() {}
          }
        }
      ]
    };
  },
  mounted() {
    this.$nextTick(() => {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.adrs, {
            click: true
          });
        } else {
          this.scroll.refresh();
        }
      });
  },
  methods: {
    show() {
      
      this.showFlag = true;
    },
    routerback(){
      this.showFlag = false;
    },
    select: function(item, index) {
      var me = this;
      me.currIndex = index;
      var point = item.location;
      me.makerConf.position = [point.lng, point.lat];
      me.center = [point.lng, point.lat];
      this.showFlag = false;
      let mapInfo ={
        address: item.address,
        location: [point.lng, point.lat]
      }
      this.$emit('mapInfo', mapInfo);
    },
    //this.$refs.map.$$getCenter()
    getList: function(result) {
      //获取列表
      var me = this;
      me.$Geocoder({
        lnglatXY: result,
        success: function(res) {
          if (res.regeocode && res.regeocode.pois) {
            me.list = res.regeocode.pois;
          } else {
            me.list = [];
          }
        },
        error: function(res) {
          me.list = [];
        }
      });
      this.scroll.refresh();
    },
    onSearchResult(pois) {
      //搜索
      var me = this;

      me.$refs.map.$$getInstance();

      if (pois && pois.length > 0) {
        //如果长度为1则无需转化
        var poi = pois[0];
        var lng = poi["lng"];
        var lat = poi["lat"];
        me.center = [lng, lat];
        me.makerConf.position = [lng, lat];
        //me.makerConf.content = poi.name;
        me.list = pois;
      } else {
        me.list = [];
      }
      this.scroll.refresh();
    },

    $Geocoder(options) {
     
      //将坐标点转化为，详细地址
      options = options || {};
      if (AMap) {
        AMap.plugin(["AMap.Geocoder"], () => {
          const geocoder = new AMap.Geocoder({
            radius: options.radius || 1000,
            extensions: options.extensions || "all"
          });
          var lnglatXY = options.lnglatXY || [114.397169, 30.50576]; //已知点坐标
          geocoder.getAddress(lnglatXY, function(status, result) {
            if (status === "complete" && result.info === "OK") {
              options.success && options.success(result);
            } else {
              options.error && options.error(status, result);
            }
          });
        });
      }
    }
  },
  watch: {
    list: function() {
      this.currIndex = 0;
    }
  }
};
</script>

<style lang="less" scoped>
._map {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 999;
  background: #fff;
  overflow: hidden;
}
.amap-page-container {
  position: relative;
}
.search-box {
  /* position: absolute !important; */
  top: 0;
  left: 0;
  width: 100% !important;
  z-index: 200 !important;
}
.amap-demo {
  height: 400px !important;
}
.amap-logo {
  display: none;
}
.amap-copyright {
  bottom: -100px;
  display: none;
}
.amap-scalecontrol {
  bottom: 4px !important;
}
.amap-geolocation-con {
  bottom: 30px !important;
  z-index: 199 !important;
}

.adrs {
  margin-top: 20px;
  height: calc(100% - 560px);
  overflow: hidden;
  li {
    border-bottom: 1px solid #eee;
    width: 100%;
    display: inline-block;
    line-height: 40px;
    padding: 20px 0;
    span {
      float: left;
      width: 95px;
      height: 80px;
      line-height: 80px;
      text-align: center;
      font-size: 28px;
      img {
        width: 40px;
      }
    }
  }
  li:last-child {
    border-bottom: none;
  }
}
ul li.active {
  color: deeppink;
}
</style>