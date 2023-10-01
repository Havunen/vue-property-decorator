import { createDecorator } from 'vue-class-component';
import { applyMetadata } from '../helpers/metadata';
/**
 * decorator of model
 * @param  event event name
 * @param options options
 * @return PropertyDecorator
 */
export function Model(event, options = {}) {
    return (target, key) => {
        applyMetadata(options, target, key);
        createDecorator((componentOptions, k) => {
            ;
            (componentOptions.props || (componentOptions.props = {}))[k] = options;
            componentOptions.model = { prop: k, event: event || k };
        })(target, key);
    };
}
