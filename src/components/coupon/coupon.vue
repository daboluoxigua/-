<template>
    <div class="coupon" v-if="showFlag">
        <div class="couponPop">
            <h2>{{Order.gradeName}}</h2>
            <ul>
                <li v-for="(item,index) in Order.coupons" :key="index" @click="toggle(item)" :class="item.isElect ? 'active':''">
                    <div class="title">{{item.title}}</div>
                    <div class="time">有效期至 {{item.failure_time}}</div>
                    <div class="checked icon-duigou iconfont"></div>
                </li>
            </ul>
        </div>
        <div class="list-mask" @click="hide"></div>
    </div>
</template>

<script>
import Vue from "vue";
export default {
    props:{
        Order:{}
    },
    data(){
        return {
            showFlag:false,
            checked: true,
            data:{}
        }
    },
    methods:{
        show(){
            this.showFlag = true
        },
        hide(){
            this.showFlag = false
        },
        toggle(e){
            if(e.isElect){
                Vue.set(e, "isElect", false);
                this.data= {}
                this.$emit("couponData", this.data);
                this.$forceUpdate();
            }else{
                
                for(let i = 0; i<this.Order.coupons.length;i++){
                    Vue.set(this.Order.coupons[i], "isElect", false);
                }
                Vue.set(e, "isElect", true);
                this.data={
                    title:e.title,
                    deno:e.deno,
                    coupon_ids:e.coupon_ids[0],
                    products:e.products[0]
                }
                this.$forceUpdate();
                this.$emit("couponData", this.data);
                setTimeout(()=>{
                    this.hide()
                },300)
            }
            
        }
    }
}
</script>

<style lang="less" scoped>
.coupon{width: 100%;height: 100%;position:absolute;left: 0;top:0;z-index: 90;
    .list-mask{width: 100%;height: 100%;position:fixed;left: 0;top:0; background: rgba(0,0,0,0.5);z-index: 90;}
    .couponPop{position:fixed;width: 90%;top: 50%;left: 50%;transform: translate(-50%,-50%);z-index: 91;background: #fff;border-radius: 10px;
        h2{padding-left: 30px;line-height: 60px;margin-top: 20px;font-size: 32px}
        ul{padding: 20px 0;max-height: 600px;overflow: auto;
            li{background: #fff3bf;border-radius: 10px;margin: 10px 20px;padding:30px 20px;position: relative;
                &.active .checked{color:#409eff}
                .title{font-size: 32px;font-weight: bold;color: #444}
                .time{color: #666;margin-top: 20px;}
                .checked{position: absolute;right: 20px;top: 50%;transform: translate(0, -50%)}
            }
        }
    }
}
</style>
