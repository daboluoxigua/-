import axios from 'axios'
import qs from 'qs'
import wx from 'weixin-js-sdk';
// import Promise from 'es6-promise'; //axios  兼容ios7  
// Promise.polyfill();

export const args = (params) => {
    var after = window.location.href.split("?")[1];
    if (after) {
        var reg = new RegExp("(^|&)" + params + "=([^&]*)(&|$)");
        var r = after.match(reg);
        if (r != null) {
            return decodeURIComponent(r[2]);
        }
        else {
            return null;
        }
    }
}


export const weixinAjax = {
    "checkLink": (tempTime, callback) => {
        axios.post('../../wx/checkLink', qs.stringify({
            tempTime: parseInt(tempTime),
        })).then(d => {
            const req = d.data;
            if (req.result == 0) {
                callback(req);
            } else {
                alert(req.errmsg);
            }
        })
    },
    "getStoreById": (appid, brandid, storeid, callback) => {
        axios.post('../../wx/getStoreById', qs.stringify({
            "appid": appid,
            "brandid": parseInt(brandid),
            "storeid": parseInt(storeid)
        })).then(d => {
            const req = d.data
            if (req.result == 0) {
                callback(req)
            } else {
                alert(req.errmsg);
            }
        })
    },
    "getTableById": (appid, brandid, storeid, callback) => {
        axios.post('../../wx/getTableById', qs.stringify({
            "appid": appid,
            "brandid": parseInt(brandid),
            "storeid": parseInt(storeid),
            "tableid": window.sessionStorage.getItem("table")
        })).then(d => {
            const req = d.data
            if (req.result == 0) {
                callback(req)
            } else {
                alert(req.errmsg);
            }
        })
    },
    "getWechatAppID": (appid, brandid, storeid, table, dishtype, callback) => {
        let option = {
            "appid": appid,
            "brandid": parseInt(brandid),
            "storeid": parseInt(storeid),
            "tableid": parseInt(table)
        };
        if (window.localStorage.getItem("browserName") == 1) {
            option.type = 1;
        }
        // console.log(this,weixinAjax)
        axios.post('../../wx/getWechatAppID', qs.stringify(option)).then(d => {
            const req = d.data;
            if (req.result == 0) {
                callback(req);
            } else {
                alert(req.errmsg);
            }
        })
    },
    "getJSParam": (appid, brandid, storeid) => {
        axios.post('../../wx/getJSParam', qs.stringify({
            "appid": appid,
            "brandid": parseInt(brandid),
            "storeid": parseInt(storeid),
            "shareurl": window.location.href
        })).then(d => {
            const req = d.data;
            const APPID = window.sessionStorage.getItem("appID")
            if (req.result == 0) {
                wx.config({
                    debug: false,
                    appId: APPID,
                    timestamp: req.content.timestamp,
                    nonceStr: req.content.noncestr,
                    signature: req.content.sign,
                    jsApiList: [
                        'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone',
                        'scanQRCode',
                        'chooseWXPay'
                    ]
                });
            } else {
                alert(req.errmsg)
            }
        })
    },
    "getOpenid": (appid, brandid, code, storeid, callback) => { // 支付宝微信做区分
        const browserName = window.localStorage.getItem("browserName");
        if (browserName == 1) {
            axios.post("../../alipay/getUserid", qs.stringify({
                "appid": appid,
                "code": code,
                "storeid": parseInt(storeid)
            })).then(d => {
                getOpenidAjax(d)
            })
        }
        if (browserName == 2) {
            axios.post("../../wx/getOpenid", qs.stringify({
                "appid": appid,
                "code": code,
                "brandid": brandid,
                "storeid": parseInt(storeid)
            })).then(d => {
                getOpenidAjax(d)
            })
        }
        function getOpenidAjax(d) {
            const req = d.data;
            if (req.result == 0) {
                window.localStorage.setItem('nickname', req.content.nickname);
                window.localStorage.setItem('headimgurl', req.content.headimgurl);
                if (browserName == 1) {
                    window.sessionStorage.setItem("openid", req.content.userid);
                } else if (browserName == 2) {
                    window.sessionStorage.setItem("openid", req.content.openid);
                    window.localStorage.setItem('subscribe', req.content.subscribe.toString().substring(0, 1));
                }
                callback();
            } else {
                if (browserName == 2) {
                    weixinCode(args('appid'), args('brandid'), args('storeid'), args('dishtype'), args('table'), sessionStorage.getItem("appID"))
                }
            }
        }
    }


}


var urlLink = '/wxdc/dist/';

//微信获取code
export const weixinCode = (appid, brandid, storeid, dishtype, table, appID) => {
    var url = location.protocol + "//" + window.location.host;
    url += urlLink + "index.html?appid=" + appid + "&brandid=" + parseInt(brandid) + "&storeid=" + parseInt(storeid) + "&dishtype=" + dishtype + "&table=" + table;
    window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appID + '&' +
        'redirect_uri=' + encodeURIComponent(url) + '&' +
        'response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';

    // url += "/wxdc/index.html?appid=" + args().appid + "&brandid=" + parseInt(args().brandid) + "&storeid=" + parseInt(args().storeid) + "&dishtype=" + args().dishtype + "&table=" + args().table;
    // 
    // window.location.href = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2016030101175068&scope=auth_user&redirect_uri=' + encodeURIComponent(url)            
}

//支付宝获取code wxdd/production/
export const zhifubaoCode = (appid, brandid, storeid, dishtype, table, appID) => {
    var url = location.protocol + "//" + window.location.host;
    url += urlLink + "index.html?appid=" + appid + "&brandid=" + parseInt(brandid) + "&storeid=" + parseInt(storeid) + "&dishtype=" + dishtype + "&code=1" + "&table=" + table;
    url = url.replace("#/", "")
    window.location.href = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=' + appID + '&scope=auth_user&redirect_uri=' + encodeURIComponent(url) 
}


//区分浏览器  1为支付宝 2为微信  3为其他浏览器
const browserFUN = () => {
    // alert("判断微信或者支付宝")
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.match(/Alipay/i) == "alipay") {
        window.localStorage.setItem("browserName", 1);
        return
    }
    if (userAgent.match(/MicroMessenger/i) == "micromessenger") {
        window.localStorage.setItem("browserName", 2);
        return
    }
    window.localStorage.setItem("browserName", 3);
    return
}
browserFUN();
