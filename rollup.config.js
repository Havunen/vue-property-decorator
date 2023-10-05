export default {
  input: 'lib/index.js',
  output: [{
    file: 'lib/index.mjs',
    format: 'esm',
    name: 'VuePropertyDecorator',
    globals: {
      vue: 'Vue',
      '@havunen/vue2-class-component': 'VueClassComponent',
    },
    exports: 'named',
  }, {
    file: 'lib/index.cjs',
    format: 'cjs',
    name: 'VuePropertyDecorator',
    globals: {
      vue: 'Vue',
      '@havunen/vue2-class-component': 'VueClassComponent',
    },
    exports: 'named',
  }],
  external: ['vue', '@havunen/vue2-class-component', 'reflect-metadata'],
}
