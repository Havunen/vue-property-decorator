import { createDecorator } from 'vue-class-component';
/**
 * decorator for capturings v-model binding to component
 * @param options the options for the prop
 */
export function VModel(options = {}) {
    const valueKey = 'value';
    return createDecorator((componentOptions, key) => {
        ;
        (componentOptions.props || (componentOptions.props = {}))[valueKey] = options;
        (componentOptions.computed || (componentOptions.computed = {}))[key] = {
            get() {
                return this[valueKey];
            },
            set(value) {
                this.$emit('input', value);
            },
        };
    });
}
