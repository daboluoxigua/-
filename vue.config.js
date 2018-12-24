// // vue.config.js
module.exports = {
    // 将baseUrl: '/api',改为baseUrl: '/',http://sz.canxingjian.com/http://www.smarant.com/
    baseUrl: './',
    // baseUrl: process.env.NODE_ENV === 'production' ? '/dist/' : '/',
    devServer: {
        proxy: {
            '/../..': {
                target: 'http://sz.canxingjian.com/',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/../..': ''
                }
            }
        }
        
    }
}
