export { default as Vue } from 'vue';
import { createDecorator } from 'vue-class-component';
export { default as Component, mixins as Mixins } from 'vue-class-component';

// Code copied from Vue/src/shared/util.js
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase();
/**
 * decorator of an event-emitter function
 * @param  event The name of the event
 * @return MethodDecorator
 */
function Emit(event) {
    return function (_target, propertyKey, descriptor) {
        const key = hyphenate(propertyKey);
        const original = descriptor.value;
        descriptor.value = function emitter(...args) {
            const emit = (returnValue) => {
                const emitName = event || key;
                if (returnValue === undefined) {
                    if (args.length === 0) {
                        this.$emit(emitName);
                    }
                    else if (args.length === 1) {
                        this.$emit(emitName, args[0]);
                    }
                    else {
                        this.$emit(emitName, ...args);
                    }
                }
                else {
                    args.unshift(returnValue);
                    this.$emit(emitName, ...args);
                }
            };
            const returnValue = original.apply(this, args);
            if (isPromise(returnValue)) {
                returnValue.then(emit);
            }
            else {
                emit(returnValue);
            }
            return returnValue;
        };
    };
}
function isPromise(obj) {
    return obj instanceof Promise || (obj && typeof obj.then === 'function');
}

/**
 * decorator of an inject
 * @param from key
 * @return PropertyDecorator
 */
function Inject(options) {
    return createDecorator((componentOptions, key) => {
        if (typeof componentOptions.inject === 'undefined') {
            componentOptions.inject = {};
        }
        if (!Array.isArray(componentOptions.inject)) {
            componentOptions.inject[key] = options || key;
        }
    });
}

function needToProduceProvide(original) {
    return (typeof original !== 'function' ||
        (!original.managed && !original.managedReactive));
}
function produceProvide(original) {
    let provide = function () {
        let rv = typeof original === 'function' ? original.call(this) : original;
        rv = Object.create(rv || null);
        // set reactive services (propagates previous services if necessary)
        rv[reactiveInjectKey] = Object.create(this[reactiveInjectKey] || {});
        for (let i in provide.managed) {
            rv[provide.managed[i]] = this[i];
        }
        for (let i in provide.managedReactive) {
            rv[provide.managedReactive[i]] = this[i]; // Duplicates the behavior of `@Provide`
            Object.defineProperty(rv[reactiveInjectKey], provide.managedReactive[i], {
                enumerable: true,
                configurable: true,
                get: () => this[i],
            });
        }
        return rv;
    };
    provide.managed = {};
    provide.managedReactive = {};
    return provide;
}
/** Used for keying reactive provide/inject properties */
const reactiveInjectKey = '__reactiveInject__';
function inheritInjected(componentOptions) {
    // inject parent reactive services (if any)
    if (!Array.isArray(componentOptions.inject)) {
        componentOptions.inject = componentOptions.inject || {};
        componentOptions.inject[reactiveInjectKey] = {
            from: reactiveInjectKey,
            default: {},
        };
    }
}

/**
 * decorator of a reactive inject
 * @param from key
 * @return PropertyDecorator
 */
function InjectReactive(options) {
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

/** @see {@link https://github.com/vuejs/vue-class-component/blob/master/src/reflect.ts} */
const reflectMetadataIsSupported = typeof Reflect !== 'undefined' && typeof Reflect.getMetadata !== 'undefined';
function applyMetadata(options, target, key) {
    if (reflectMetadataIsSupported) {
        if (!Array.isArray(options) &&
            typeof options !== 'function' &&
            !options.hasOwnProperty('type') &&
            typeof options.type === 'undefined') {
            const type = Reflect.getMetadata('design:type', target, key);
            if (type !== Object) {
                options.type = type;
            }
        }
    }
}

/**
 * decorator of model
 * @param  event event name
 * @param options options
 * @return PropertyDecorator
 */
function Model(event, options = {}) {
    return (target, key) => {
        applyMetadata(options, target, key);
        createDecorator((componentOptions, k) => {
            (componentOptions.props || (componentOptions.props = {}))[k] = options;
            componentOptions.model = { prop: k, event: event || k };
        })(target, key);
    };
}

/**
 * decorator of synced model and prop
 * @param propName the name to interface with from outside, must be different from decorated property
 * @param  event event name
 * @param options options
 * @return PropertyDecorator
 */
function ModelSync(propName, event, options = {}) {
    return (target, key) => {
        applyMetadata(options, target, key);
        createDecorator((componentOptions, k) => {
            (componentOptions.props || (componentOptions.props = {}))[propName] = options;
            componentOptions.model = { prop: propName, event: event || k };
            (componentOptions.computed || (componentOptions.computed = {}))[k] = {
                get() {
                    return this[propName];
                },
                set(value) {
                    // @ts-ignore
                    this.$emit(event, value);
                },
            };
        })(target, key);
    };
}

/**
 * decorator of a prop
 * @param  options the options for the prop
 * @return PropertyDecorator | void
 */
function Prop(options = {}) {
    return (target, key) => {
        applyMetadata(options, target, key);
        createDecorator((componentOptions, k) => {
            (componentOptions.props || (componentOptions.props = {}))[k] = options;
        })(target, key);
    };
}

/**
 * decorator of a synced prop
 * @param propName the name to interface with from outside, must be different from decorated property
 * @param options the options for the synced prop
 * @return PropertyDecorator | void
 */
function PropSync(propName, options = {}) {
    return (target, key) => {
        applyMetadata(options, target, key);
        createDecorator((componentOptions, k) => {
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

/**
 * decorator of a provide
 * @param key key
 * @return PropertyDecorator | void
 */
function Provide(key) {
    return createDecorator((componentOptions, k) => {
        let provide = componentOptions.provide;
        inheritInjected(componentOptions);
        if (needToProduceProvide(provide)) {
            provide = componentOptions.provide = produceProvide(provide);
        }
        provide.managed[k] = key || k;
    });
}

/**
 * decorator of a reactive provide
 * @param key key
 * @return PropertyDecorator | void
 */
function ProvideReactive(key) {
    return createDecorator((componentOptions, k) => {
        let provide = componentOptions.provide;
        inheritInjected(componentOptions);
        if (needToProduceProvide(provide)) {
            provide = componentOptions.provide = produceProvide(provide);
        }
        provide.managedReactive[k] = key || k;
    });
}

/**
 * decorator of a ref prop
 * @param refKey the ref key defined in template
 */
function Ref(refKey) {
    return createDecorator((options, key) => {
        options.computed = options.computed || {};
        options.computed[key] = {
            cache: false,
            get() {
                return this.$refs[refKey || key];
            },
        };
    });
}

/**
 * decorator for capturings v-model binding to component
 * @param options the options for the prop
 */
function VModel(options = {}) {
    const valueKey = 'value';
    return createDecorator((componentOptions, key) => {
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

/**
 * decorator of a watch function
 * @param  path the path or the expression to observe
 * @param  watchOptions
 */
function Watch(path, watchOptions = {}) {
    return createDecorator((componentOptions, handler) => {
        componentOptions.watch || (componentOptions.watch = Object.create(null));
        const watch = componentOptions.watch;
        if (typeof watch[path] === 'object' && !Array.isArray(watch[path])) {
            watch[path] = [watch[path]];
        }
        else if (typeof watch[path] === 'undefined') {
            watch[path] = [];
        }
        watch[path].push({ handler, ...watchOptions });
    });
}

export { Emit, Inject, InjectReactive, Model, ModelSync, Prop, PropSync, Provide, ProvideReactive, Ref, VModel, Watch };
