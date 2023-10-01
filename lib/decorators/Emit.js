// Code copied from Vue/src/shared/util.js
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase();
/**
 * decorator of an event-emitter function
 * @param  event The name of the event
 * @return MethodDecorator
 */
export function Emit(event) {
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
