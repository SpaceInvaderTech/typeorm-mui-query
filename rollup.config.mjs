import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/main.ts',
  external: ['typeorm'],
  output: {
    dir: 'output',
    format: 'cjs',
  },
  plugins: [typescript(), terser()],
};
