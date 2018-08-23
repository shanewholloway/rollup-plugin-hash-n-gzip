import pkg from './package.json'
const external = ['crypto', 'fs', 'path', 'util', 'zlib']

export default {
	input: 'code/index.jsy',
	output: [
		{file: pkg.module, format: 'es'},
		{file: pkg.main, format: 'cjs'}],
  external }
