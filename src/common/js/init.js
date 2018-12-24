import * as AJAX from './ajax.js'
const { checkLink, getStoreById, getWechatAppID, getTableById } = AJAX.weixinAjax
const { args, weixinCode, zhifubaoCode } = AJAX

const openid = args("openid");

const init = () => {
    window.localStorage.setItem("appid", args("appid"));
    window.localStorage.setItem("storeid", args("storeid"));
    window.localStorage.setItem("brandid", args("brandid"));
    window.sessionStorage.setItem("dishtype", args("dishtype"));
    window.sessionStorage.setItem("table", args("table"));
    if (!args("code")) {//判断是否是刚刚进入页面
        beginAjax();
    }
}


const beginAjax = () => {
    if (args("dishtype") == 2) {//判断是否是要进入点餐
        isTempTime();
    } else {//获取订单列表时候直接获取appID
        getWechatAppIDCallBack();
    }
}


const isTempTime = () => {//判断是否链接过期了
    var isEffectiveUrl = args("tempTime") ? args("tempTime") : false;
    if (isEffectiveUrl) {
        checkLink(args("tempTime"), (req) => {
            if (!req.data) {
                alert('链接已过期请重新扫码');
                setTimeout(function () { WeixinJSBridge.call('closeWindow'); }, 200);
            } else {
                getStoreByIdCallback();
            }
        })
    } else {
        getStoreByIdCallback();
    }
}


const getWechatAppIDCallBack = () => {
    getWechatAppID(args('appid'), args('brandid'), args('storeid'), args('table'), args('dishtype'), (req) => {
        window.sessionStorage.setItem("appID", req.content.appid);
        window.localStorage.setItem("tableName", req.content.tableName);
        if (openid) {//吉野家跳转用
            window.sessionStorage.setItem('openid', args('openid'))
            getTableById(args('appid'), args('brandid'), args('storeid'), (req) => {
                if (req.result == 0) {
                    window.localStorage.setItem("tableName", req.content.tableName);
                    window.location.href = window.location.origin + window.location.pathname + window.location.search + '&code=1';
                } else {
                    alert(req.errmsg)
                }
            })
        }
        if (window.localStorage.getItem("browserName") == 1 && !openid) {
            //支付宝获取code
            zhifubaoCode(args('appid'), args('brandid'), args('storeid'), args('dishtype'), args('table'), req.content.appid)
        } else if (window.localStorage.getItem("browserName") == 2 && !openid) {
            //微信获取code
            weixinCode(args('appid'), args('brandid'), args('storeid'), args('dishtype'), args('table'), req.content.appid)

        } else {
            // alert("亲，请用支付宝或者微信扫码")
        }
    })
}

const getStoreByIdCallback = () => {
    getStoreById(args('appid'), args('brandid'), args('storeid'), (req) => {
        if (req.result == 0) {
            window.localStorage.setItem("displayIndex", req.data.displayIndex);//是否需要首页

            window.localStorage.setItem("toggle", req.data.toggle);//点餐页面效果 false 为滑动，true为tab切换

            window.localStorage.setItem("cache", req.data.cache);//点餐页面效果 false 为滑动，true为tab切换

            window.localStorage.setItem("point", [req.data.longitude,req.data.latitude]);//点餐页面效果 false 为滑动，true为tab切换
            //是否开启外卖
            window.localStorage.setItem("saleOut", req.data.saleOut);
            //缓存门店名字
            window.localStorage.setItem("welcomeSname", req.data.sname);
            //缓存门店logo
            window.localStorage.setItem("welcomeStoreImg", req.data.storeImg);
            //是否需要输入就餐人数
            window.localStorage.setItem("repastPopulation", req.data.repastPopulation);
            //是否需要会员输入手机号
            window.localStorage.setItem("isNeedMember", req.data.needMember);
            //是否需要显示会员价格
            window.localStorage.setItem("showMemberPrice", req.data.showMemberPrice);
            window.localStorage.setItem("isPayRecommended", req.data.isPayRecommended);//是否需要推荐
            window.localStorage.setItem("recommend", req.data.recommend);//推荐标题

            getWechatAppIDCallBack();
        }
    })
}

init();