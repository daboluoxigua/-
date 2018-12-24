// // // vue.config.js
module.exports = {
    // 将baseUrl: '/api',改为baseUrl: '/',http://sz.canxingjian.com/http://www.smarant.com/
    baseUrl: './',
    devServer: {
        proxy: {
            '../..': {
                target: 'http://sz.canxingjian.com',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^../..': ''
                }
            }
        }

    }
}