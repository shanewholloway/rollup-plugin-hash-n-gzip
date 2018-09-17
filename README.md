# rollup-plugin-hash-n-gzip

Hash and gzip outputs. Updated for Rollup 0.64+.

Used for static serving of gzip compressed files with filename based cache
busting and source integrity calculation.

Combine with [rollup-plugin-web-build-events](https://github.com/shanewholloway/rollup-plugin-web-build-events#DataLive)
for an integrated live-reload development experience.

## Example

Generate a static `public/` folder with gzip'd files and a preprocessed `public/index.html` and `public/dynamic.json`.
Then serve with packages like [express-static-gzip][] or [koa-static][].

 [express-static-gzip]: https://github.com/tkoenig89/express-static-gzip#readme
 [koa-static]: https://github.com/koajs/static#readme

```javascript
import rpi_hash_n_gzip from 'rollup-plugin-hash-n-gzip'

const plugins = [rpi_hash_n_gzip({onAltMapping, altBase})]

export default [
	{ input: ['src/main-a.js', 'src/main-b.js'],
		output: { dir: 'public/module', format: 'es', sourcemap: true },
		plugins, experimentalCodeSplitting: true },
]


let tid
function onAltMapping(altNames, altRoot, ns) {
  Object.assign(ns, altNames)
  console.log(`onAltMapping for "${altRoot}"`)

  // debounce rebuilding depenent outputs as necessary. (e.g. index.html)
  clearTimeout(tid)
  tid = setTimeout(rebuildRoot, 100, ns)
}

function rebuildRoot(ns) {
  fs.writeFile('public/dynamic.json',
    JSON.stringify(ns, null, 2),
    err => err && console.error(err) )

  // Or use a templating engine here
  const index_html = `\
<!doctype html>
<head>
  <title>rollup-plugin-hash-n-gzip example</title>
  <script type=module src='${ns['public/module/main-a.js']}'></script>
  <script type=module src='${ns['public/module/main-b.js']}'></script>
</head>
<body>
  Look in your inspector
</body>`

  fs.writeFile('public/index.html', index_html,
    err => err && console.error(err) )
}
```

## Rollup Plugin Options

```javascript
import rpi_hash_n_gzip from 'rollup-plugin-hash-n-gzip'

const plugins = [
  rpi_hash_n_gzip({
    minSize: 14e3, // souces over this size will be gzip'd
    gzip_options: null, // zlib gzip options
    hash_algorithm: 'sha1',
    skip(outputFileName, bndl) {}, // allows excluding some bundles from processing (e.g. code splits)

    contentBase: null, // path that resolved updates are relative to
    onBuildUpdate({updates}) {}, // callback for each generateBundle processing
  })
]
```

## License

[MIT](LICENSE)

Some code inspired and/or sourced from:

- [kryops/rollup-plugin-gzip](https://github.com/kryops/rollup-plugin-gzip) (MIT)
- [rollup/rollup-starter-code-splitting](https://github.com/rollup/rollup-starter-code-splitting) (MIT)
