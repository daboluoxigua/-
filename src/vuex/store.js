//store.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

//定义state，并将listName设置为一个空对象
const state = {
    selectFoods: {},//所选菜品
    totalPrice:0,//菜品总价
    addressInfo:{},//地址信息
    dataInit:true,//
    phoneNum:null//会员手机号码 支付宝用
}
//定义mutations，可以传参，用于设置state里的listName
const mutations = {
    set_selectFoods: (state, value) => {
        state.selectFoods = value
    },
    set_totalPrice: (state, value) =>{
        state.totalPrice = value
    },
    set_addressInfo: (state, value) => {
        state.addressInfo = value
    },
    set_dataInit: (state, value) => {
        state.dataInit = value
    },
    set_phoneNum: (state, value) => {
        state.phoneNum = value
    }
}
//定义getters，用于获取出state里的对象
const getters = {
    get_selectFoods: state => {
        return state.selectFoods
    },
    get_totalPrice: state => {
        return state.totalPrice
    },
    get_addressInfo: state => {
        return state.addressInfo
    },
    get_dataInit: state => {
        return state.dataInit
    },
    get_phoneNum: state => {
        return state.phoneNum
    }
}

export default new Vuex.Store({
    getters,
    state,
    mutations
})