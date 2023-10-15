/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  // 1. 接受一个 plugin 参数
  Vue.use = function (plugin: Function | Object) {
    // 2. 内部维护一个 _installedPlugins 数组
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 3. 查找插件是否被安装过
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this) // 4. 将 Vue 实例装入了 args 中

    // 5. 判断 plugin 是否定义了 install 方法，有的话调用
    if (typeof plugin.install === 'function') {
      // 6. 执行 install 方法的同时，将 Vue 实例传递进去
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }

    // 7. 将插件装入维护的数组 this._installedPlugins
    installedPlugins.push(plugin)

    return this
  }
}
