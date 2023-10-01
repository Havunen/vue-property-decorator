export default {
  input: 'lib/index.js',
  output: {
    file: 'lib/index.mjs',
    format: 'esm',
    name: 'VuePropertyDecorator',
    globals: {
      vue: 'Vue',
      'vue-class-component': 'VueClassComponent',
    },
    exports: 'named',
  },
  external: ['vue', 'vue-class-component', 'reflect-metadata'],
}
