import pkg from './package.json'
const external = ['crypto', 'fs', 'path', 'util', 'zlib']

export default {
	input: 'code/index.js',
	output: [
		{file: pkg.module, format: 'es'},
		{file: pkg.main, format: 'cjs', exports: 'named'}],
  external }
