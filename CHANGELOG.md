# rollup-plugin-hash-n-gzip

## 3.0.0

* Factored out `onBuildUpdate`, `onAltMapping`, and error tracking into emerging [rollup-plugin-web-build-events](https://github.com/shanewholloway/rollup-plugin-web-build-events).

## 2.2.0

* Added `onBuildUpdate` standard implementation of onAltMapping

## 2.1.0

* Added error tracking to onAltMapping callback

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
