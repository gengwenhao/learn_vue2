import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue) // 拓展 _init()
stateMixin(Vue) // 拓展 $set $delete $watch
eventsMixin(Vue) // 拓展 $on $once $off $emit
lifecycleMixin(Vue) // 拓展 _update $forceUpdate $destroy
renderMixin(Vue) // 拓展 $nextTick _render

export default Vue
