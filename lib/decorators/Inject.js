import { createDecorator } from 'vue-class-component';
/**
 * decorator of an inject
 * @param from key
 * @return PropertyDecorator
 */
export function Inject(options) {
    return createDecorator((componentOptions, key) => {
        if (typeof componentOptions.inject === 'undefined') {
            componentOptions.inject = {};
        }
        if (!Array.isArray(componentOptions.inject)) {
            componentOptions.inject[key] = options || key;
        }
    });
}
