const fs = require('fs')
const path = require('path')
const looksSame = require('looks-same')
const PNG = require('pngjs2').PNG

let SPEC_POSTFIX
let HEAD_POSTFIX
let DIFF_POSTFIX
let HIGHLIGHT
let SNAPSHOT_POSTFIX

/**
 * Creates a new object filled with test functions with the provided configuration.
 * If no configuration or partial configuration is provided, defaults will be filled in.
 */
module.exports = ((config) => {
	config = config || {}
	SPEC_POSTFIX = config.specPostfix || '.spec'
	HEAD_POSTFIX = config.headPostfix || '.head'
	DIFF_POSTFIX = config.diffPostfix || '.diff'
	HIGHLIGHT = config.highlightColor || '#ff00ff'
	SNAPSHOT_POSTFIX = (process.env.TEST_MODE === 'update') ? SPEC_POSTFIX : HEAD_POSTFIX

	return {
		fromFile,
		imageParity,
		mockCanvas,
		snapshotPng,
	}
})

/**
 * Mocks a network request by loading a local test fixture file instead.
 * @param {String} url requested url
 * @param {Function} pathMapFn function mapping url to a local resource.
 * @returns {Promise} a Promise containing a local test fixture file or error.
 */
function fromFile(url, pathMapFn) {
  const path = pathMapFn(url)
  return new Promise((resolve, reject) => {
    fs.readFile(path, {encoding: 'utf8'}, (e, data) => {
      e && reject(e)
      resolve(data)
    })
  })
}

/**
 * Creates a mock canvas element to add to the mocked gl context
 * @param {any} gl the webGL context
 * @param {Object} defineProperties collection to map to Object.defineProperties calls
 */
function mockCanvas(gl, defineProperties) {
  let canvas = document.createElement('canvas')
  for(const key in defineProperties) {
    const properties = {...defineProperties[key], writable: true}
    Object.defineProperty(canvas, key, properties)
  }
  Object.defineProperty(gl, 'canvas', {value: canvas})
}

/**
 * Takes a rendered PNG image of the glCotext
 * @param {any} gl the webGL context
 * @param {String} imagePath path to save the screenshot
 * @param {Number} width in px
 * @param {Number} height in px
 * @returns {Promise} a Promise resolving to the saved image path
 */
function snapshotPng(gl, imagePath, width, height) {
  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  let png = new PNG({width: width, height: height})
  png.data = pixels

  return new Promise((resolve, reject) => {
    png.pack()
    .pipe(fs.createWriteStream(imagePath))
		.on('finish', () => resolve(imagePath))
  })
}

/**
 * Tests that two glContexts are the same. If found, differences are highlighted in a diff image.
 * @param {any} gl the webGL context
 * @param {String} dirName the image comparison directory
 * @param {String} imageName the name of the image sans postfix and extension (test.spec.js => 'test')
 * @param {boolean} strict do strict comparison (default = true)
 * @param {boolean} errorDiff save a diff image on error (default = true)
 */
function imageParity(gl, dirName, imageName, strict = true, errorDiff = true) {
  if(!gl.canvas.clientWidth || !gl.canvas.clientHeight) {
    throw new Error('Canvas does not have clientWidth and clientHeight')
  }

  // when updating, reference and current file paths should be the same to guarantee parity
  const reference = path.resolve(dirName, imageName) + SPEC_POSTFIX + '.png'
  const current = path.resolve(dirName, imageName) + SNAPSHOT_POSTFIX + '.png'
  const diff = path.resolve(dirName, './output', (imageName + DIFF_POSTFIX + '.png'))

  return new Promise(async (resolve, reject) => {
    snapshotPng(gl, current, gl.canvas.clientWidth, gl.canvas.clientHeight)
      .then((savedFile) => diffImage(reference, current, diff, strict, errorDiff))
      .then(resolve)
  })
}

function diffImage(reference, current, diff, strict = true, errorDiff = true) {
  return new Promise((resolve, reject) => {
    looksSame(reference, current, {strict}, (error, equal) => {
      error && reject(error)
      if(!equal && errorDiff) {
        looksSame.createDiff({reference, current, diff, highlightColor: HIGHLIGHT, strict}, (e) => reject(e))
      } else {
        fs.unlink(diff)
      }
      resolve(equal)
    })
  })
}
