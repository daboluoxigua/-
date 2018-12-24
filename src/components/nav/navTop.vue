<template>
  <div class="nav">
    <div class="nav-left" @click="routerback">
      <i class="iconfont">&#xe601;</i>
    </div>
    <h2>{{title}}</h2>
  </div>
</template>

<script>
export default {
  props: ["title"],
  methods: {
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
    }
  }
};
</script>

<style lang="less">
@import "../../common/css/common.less";
.nav{width: 100%;height: 80*@rem;line-height: 80*@rem;position: relative; background: #ea5a49;
  .nav-left{width: 80*@rem;color: #fff;text-align: center;position:absolute;left: 0;
    i{font-size: 32*@rem;}
  }
  h2{text-align: center;color: #fff;font-size:32*@rem}
}

</style>
