const fs = require('fs')
import rpi_hash_n_gzip from 'rollup-plugin-hash-n-gzip'

const sourcemap = true //'inline'
const plugins = [rpi_hash_n_gzip({minSize: 200, onBuildUpdate})]

// NOTE: main-a, main-b and similar copied from https://github.com/rollup/rollup-starter-code-splitting (MIT)

export default [
  { input: 'test/first.js',
    output: [
      {file: 'test-out/esm/first.js', format: 'es', sourcemap},
      {file: 'test-out/cjs/first.js', format: 'cjs', sourcemap},
      {file: 'test-out/umd/first.js', format: 'umd', sourcemap},
    ],
    plugins },

  { input: ['test/main-a.js', 'test/main-b.js'],
    output: [
      {dir: 'test-out/esm/', format: 'es', sourcemap},
      {dir: 'test-out/cjs/', format: 'cjs', sourcemap},
    ],
    plugins, experimentalCodeSplitting: true },
]


const mapping = {}, sri_refs = {}
const mergedBuildUpdate = debounce(100, onMergedBuildUpdate)
function onBuildUpdate({updates}) {
  if (updates) {
    for (const [k,v] of updates) {
      mapping[k] = v
      sri_refs[k] = `src='${v.src}' integrity='${v.integrity}'`
    }
  }

  mergedBuildUpdate(mapping, sri_refs)
}

function onMergedBuildUpdate(mapping, sri_refs) {
  console.log(`merged:`, mapping)
  console.log()

  fs.writeFile('test-out/dynamic.json',
    JSON.stringify(mapping, null, 2),
    err => err && console.error(err) )

  // Or use a templating engine here
  const index_html = `\
<!doctype html>
<head>
  <title>rollup-plugin-hash-n-gzip example</title>
  <script ${sri_refs['esm/first.js']}></script>
  <script type=module ${sri_refs['esm/main-a.js']}></script>
  <script type=module ${sri_refs['esm/main-b.js']}></script>
</head>
<body>
  Look in your inspector

	<div id='a'>
		<div data-used-by='a'></div>
		<div data-used-by='both'></div>
	</div>

	<div id='b'>
		<div data-used-by='b'></div>
		<div data-used-by='both'></div>
	</div>
</body>`

  fs.writeFile('test-out/index.html', index_html,
    err => err && console.error(err) )

  console.log()
  console.log('~ ~ ~ index.html ~ ~ ~')
  console.log(index_html)
  console.log('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~')
  console.log()
}


function debounce(ms, fn_inner) {
  let tid, apply_inner = args => fn_inner.apply(this, args)
  return function () {
    tid = clearTimeout(tid),
    tid = setTimeout(apply_inner, ms, arguments)
    return tid }
}
