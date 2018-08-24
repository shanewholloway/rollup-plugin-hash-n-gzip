# rollup-plugin-hash-n-gzip

## 2.0.1

* Changed sourcemap reference url to include hash

## 2.0.0

* Changed to use [new plugin API](https://github.com/rollup/rollup/wiki/Plugins#creating-plugins) with `rollup@0.64.x`.

## 1.0.4

* Removed Babel / JSY build tools.

## 1.0.3

* Fix unlink for small size to use promise wrapped fs.unlink.

## 1.0.2

* Remove possible 'outfile.gz' if output size dropped under the threshold.

## 1.0.1

* Fixed calling plugin with no arguments

## 1.0.0

* First release
