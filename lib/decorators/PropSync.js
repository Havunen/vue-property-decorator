import { createDecorator } from 'vue-class-component';
import { applyMetadata } from '../helpers/metadata';
/**
 * decorator of a synced prop
 * @param propName the name to interface with from outside, must be different from decorated property
 * @param options the options for the synced prop
 * @return PropertyDecorator | void
 */
export function PropSync(propName, options = {}) {
    return (target, key) => {
        applyMetadata(options, target, key);
        createDecorator((componentOptions, k) => {
            ;
            (componentOptions.props || (componentOptions.props = {}))[propName] = options;
            (componentOptions.computed || (componentOptions.computed = {}))[k] = {
                get() {
                    return this[propName];
                },
                set(value) {
                    this.$emit(`update:${propName}`, value);
                },
            };
        })(target, key);
    };
}
