import Vue from 'vue'
import { createDecorator } from '@havunen/vue2-class-component'

/**
 * decorator of a ref prop
 * @param refKey the ref key defined in template
 */
export function Ref(refKey?: string) {
  return createDecorator((options, key) => {
    options.computed = options.computed || {}
    options.computed[key] = {
      cache: false,
      get(this: Vue) {
        return this.$refs[refKey || key]
      },
    }
  })
}
