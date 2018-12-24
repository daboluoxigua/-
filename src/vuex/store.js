//store.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

//定义state，并将listName设置为一个空对象
const state = {
    selectFoods: {},
    totalPrice:0,
    addressInfo:{}
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
    }
}

export default new Vuex.Store({
    getters,
    state,
    mutations
})