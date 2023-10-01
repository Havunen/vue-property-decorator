import { createDecorator } from 'vue-class-component';
import { applyMetadata } from '../helpers/metadata';
/**
 * decorator of a prop
 * @param  options the options for the prop
 * @return PropertyDecorator | void
 */
export function Prop(options = {}) {
    return (target, key) => {
        applyMetadata(options, target, key);
        createDecorator((componentOptions, k) => {
            ;
            (componentOptions.props || (componentOptions.props = {}))[k] = options;
        })(target, key);
    };
}
