const path = require('path')
const { promisify } = require('util')
const { createHash } = require('crypto')
const p_gzip = promisify(require('zlib').gzip)

export default hash_n_gzip

// Updated to Rollup 0.64+ based on research from https://github.com/kryops/rollup-plugin-gzip (MIT)
export function hash_n_gzip({minSize, gzip_options, hash_algorithm, skip, contentBase, onBuildUpdate}={}) {
  const plugin_name = 'hash-n-gzip'
  if (null == hash_algorithm) hash_algorithm = 'sha256'
  if (null == minSize) minSize = 14e3
  if (null == skip) skip = fn => fn.startsWith('chunk-')
  if (null != onBuildUpdate && 'function' !== typeof onBuildUpdate) {
    if ('function' !== typeof onBuildUpdate.withBuildUpdater)
      throw new TypeError('Expected onBuildUpdate to be a function or object implementing withBuildUpdater')

    onBuildUpdate = onBuildUpdate.withBuildUpdater(plugin_name)
  }

  const gz = '.gz'

  return {
    name: plugin_name,
    async generateBundle(outputOpts, bundle, isWrite) {
      if (!isWrite) return

      const outDir = outputOpts.dir || path.dirname(outputOpts.file)
      if (null == contentBase)
        contentBase = outDir.split(path.sep, 1)[0]

      const outRoot = path.relative(contentBase, outDir)

      const updates = []
      for (const [outputFileName, bndl] of Object.entries(bundle)) {
        if (skip(outputFileName, bndl)) continue

        const code = bndl.code
        if (('string' !== typeof code) && !Buffer.isBuffer(code)) continue

        const code_hash = createHash(hash_algorithm).update(code).digest('base64')
          .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')

        const {name: basename, ext} = path.parse(outputFileName)
        const hashFileName = basename + '.' + code_hash + ext
        bundle[hashFileName] = bndl

        const content = asOutputContent(bndl, hashFileName, outputOpts.sourcemap)
        bundle[hashFileName+'.raw'+ext] = content

        const hash_content = createHash(hash_algorithm).update(content).digest('base64')
        const integrity = hash_algorithm + '-' + hash_content

        const basic = path.join(outRoot, outputFileName)
        const src = path.join(outRoot, hashFileName)
        const entry = { basic, src, integrity }
        updates.push([basic, entry])

        if (minSize > 0 && minSize < content.length) {
          const gz_content = await p_gzip(content, gzip_options)
          bundle[outputFileName + gz] = gz_content
          bundle[hashFileName + gz] = gz_content
        }
      }

      if (0 !== updates.length && onBuildUpdate)
        onBuildUpdate({updates})
    },
} }


/**
 * Gets the string/buffer content from a file object.
 * Important for adding source map comments
 *
 * Copied from rollup-plugin-gzip (MIT)
 * https://github.com/kryops/rollup-plugin-gzip/blob/cf50b389a492de11683f9e9efbcd52ad9efc218f/src/index.ts#L74-L102
 *
 * Copied partially from rollup.writeOutputFile (MIT)
 * https://github.com/rollup/rollup/blob/master/src/rollup/index.ts#L454
 */
export function asOutputContent(bndl, outputFileName, sourcemap) {
  let content = bndl.code
  if (sourcemap && bndl.map) {
    const url = 'inline' === sourcemap
      ? bndl.map.toUrl()
      : `${outputFileName}.map`

    const nl = content.endsWith('\n') ? '' : '\n'
    content += `${nl}//# source${ '' }MappingURL=${url}\n`
  }
  return content
}

