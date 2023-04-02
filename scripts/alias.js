// 这个文件专门用于处理别名
const path = require('path')

// __dirname 是 node 中的全局变量，表示当前执行模块的所在目录
// 也就是 scripts 这个目录
// 所以 resolve(p) 表示返回 `vue-2.6.14/${p}`
const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
  compiler: resolve('src/compiler'),
  core: resolve('src/core'),
  shared: resolve('src/shared'),
  web: resolve('src/platforms/web'),
  weex: resolve('src/platforms/weex'),
  server: resolve('src/server'),
  sfc: resolve('src/sfc')
}
