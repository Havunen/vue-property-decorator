import { createDecorator } from 'vue-class-component';
import { reactiveInjectKey } from '../helpers/provideInject';
/**
 * decorator of a reactive inject
 * @param from key
 * @return PropertyDecorator
 */
export function InjectReactive(options) {
    return createDecorator((componentOptions, key) => {
        if (typeof componentOptions.inject === 'undefined') {
            componentOptions.inject = {};
        }
        if (!Array.isArray(componentOptions.inject)) {
            const fromKey = !!options ? options.from || options : key;
            const defaultVal = (!!options && options.default) || undefined;
            if (!componentOptions.computed)
                componentOptions.computed = {};
            componentOptions.computed[key] = function () {
                const obj = this[reactiveInjectKey];
                return obj ? obj[fromKey] : defaultVal;
            };
            componentOptions.inject[reactiveInjectKey] = reactiveInjectKey;
        }
    });
}
