const path = require('path')
const { promisify } = require('util')
const { createHash } = require('crypto')
const p_gzip = promisify(require('zlib').gzip)

// Updated to Rollup 0.64+ based on research from https://github.com/kryops/rollup-plugin-gzip (MIT)
export default function hash_n_gzip({minSize, gzip_options, hash_algorithm, skip, altBase, onAltMapping}={}) {
  if (null == hash_algorithm) hash_algorithm = 'sha1'
  if (null == minSize) minSize = 14e3
  if (null == skip) skip = fn => fn.startsWith('chunk-')
  const gz = '.gz'
  let altMapping = Object.create(null)

  return {
    name: 'hash-n-gzip',
    async generateBundle(outputOpts, bundle, isWrite) {
      if (!isWrite) return

      const outDir = outputOpts.dir || path.dirname(outputOpts.file)
      if (null == altBase)
        altBase = outDir.split(path.sep, 1)[0]

      const altRoot = path.relative(altBase, outDir)
      const altNames = {}

      for (const [outputFileName, bndl] of Object.entries(bundle)) {
        if (skip(outputFileName, bndl)) continue

        const code = bndl.code
        if (('string' !== typeof code) && !Buffer.isBuffer(code)) continue

        const hash = '.' + createHash(hash_algorithm).update(code).digest('hex')

        const {name: basename, ext} = path.parse(outputFileName)
        const hashFileName = basename + hash + ext
        bundle[hashFileName] = bndl

        altNames[path.join(altRoot, outputFileName)] = path.join(altRoot, hashFileName)

        const content = asOutputContent(bndl, hashFileName, outputOpts.sourcemap)
        if (minSize < content.length) {
          const gz_content = await p_gzip(content, gzip_options)
          bundle[outputFileName + gz] = gz_content
          bundle[hashFileName + gz] = gz_content
        }
      }

      if (onAltMapping)
        altMapping = onAltMapping(altNames, altRoot, altMapping) || altMapping
    }
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

      content += `\n//# source${ '' }MappingURL=${url}\n`
  }
  return content
}

