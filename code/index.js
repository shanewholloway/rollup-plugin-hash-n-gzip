const path = require('path')
const {promisify} = require('util')
const {createHash} = require('crypto')
const {createGzip} = require('zlib')
const {stat, unlink, copyFile, writeFile, createReadStream, createWriteStream} = require('fs')

const p_stat = promisify(stat)
const p_unlink = promisify(unlink)
const p_copyFile = promisify(copyFile)
const p_writeFile = promisify(writeFile)

hash_n_gzip.hashFile = hashFile
hash_n_gzip.compressFile = compressFile
export default function hash_n_gzip({minSize, hash_algorithm}={}) {
  return {
    name: 'hash-n-gzip',
    async onwrite(buildOpts) {
      const file = buildOpts.file
      const gzfile = `${file}.gz`
      const [h, compressed] = await Promise.all([
        hashFile(file, hash_algorithm),
        compressFile(file, gzfile, minSize) ])

      const fname_parts = path.parse(file)
      fname_parts.base = null
      fname_parts.ext = `.${h}${fname_parts.ext}`

      const dest_hash = path.format(fname_parts)
      await Promise.all([
        p_copyFile(file, dest_hash),
        compressed && p_copyFile(gzfile, `${dest_hash}.gz`) ])
      await p_writeFile(`${file}.lnk`, path.basename(dest_hash))
} } }

function hashFile(file, algorithm) {
  if (! algorithm) algorithm = 'sha1'
  return new Promise((resolve, reject) =>
    createReadStream(file)
      .pipe(createHash(algorithm))
      .on('error', reject)
      .on('data', h => resolve(h.toString('hex')))
) }

function compressFile(file, outfile, minSize) {
  if (! outfile) outfile = `${file}.gz`
  if (! minSize) minSize = 14e3

  return p_stat(file).then(stat => {
    if (stat.size <= minSize)
      // remove (possibly) existing .gz file
      return p_unlink(outfile)
        .then(fn_false, fn_false) // and return false

    return new Promise((resolve, reject) =>
      createReadStream(file)
        .pipe(createGzip())
        .pipe(createWriteStream(outfile))
        .on('error', reject)
        .on('finish', () => resolve(true))
) }) }

function fn_false() { return false }
