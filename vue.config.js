// // // vue.config.js
module.exports = {
    // 将baseUrl: '/api',改为baseUrl: '/',http://sz.canxingjian.com/http://www.smarant.com/
    baseUrl: './',
    // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建
    productionSourceMap: false,//去除打包后生成的.map文件
    devServer: {
        proxy: {
            '../..': {
                target: 'http://sz.canxingjian.com',
                changeOrigin: true,
                ws: false,
                pathRewrite: {
                    '^../..': ''
                }
            }
        }

    },
}