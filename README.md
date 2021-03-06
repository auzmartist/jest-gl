# jest-gl [![npm version](https://badge.fury.io/js/jest-gl.svg)](https://badge.fury.io/js/jest-gl) [![Build Status](https://travis-ci.org/auzmartist/jest-gl.svg?branch=master)](https://travis-ci.org/auzmartist/jest-gl)
> `jest-gl` contains various helper functions allow you to easily write browserless visual tests around your webGL code. The library uses headless-gl, looks-same, and pngjs2 packages to provide a small API for saving, diffing, and comparing images of a mocked webGL context.

## Dependencies
- [headless-gl](https://github.com/stackgl/headless-gl)
- `jest-gl` **does not** have a dependency on Jest. However, it was designed with Jest testing in mind.

## Installation
```bash
npm i jest-gl --save-dev
yarn add jest-gl --dev
```

## Getting Started
`jest-gl` uses file name postfixes to distingush between visual testing images:
- `.spec` an image representing the desired look of the webGL application
- `.head` an image representing the current look of the webGL applicaton
- `.diff` an image representing a comparison of a .spec and .head file with highlighted differences

Names and the highlight color are all **optionally** configurable to match your organization's preferences. In your test file:
```javascript
let jestGl = require('../index.js')({
  specPostfix: '.spec', // postfix tag to spec images - default shown
  headPostfix: '.head', // postfix tag to head images - default shown
  diffPostfix: '.diff', // postfix tag to diff images - default shown
  highlightColor: '#ff00ff', // diff highlight color - default shown (hot-pink)
})
```
`jest-gl` helper functions are now available!

```javascript
// create a headless-gl context (https://github.com/stackgl/headless-gl)
const gl = require('gl')(500, 300, {preserveDrawingBuffer: true})

describe('gl visual tests', () => {
  beforeAll(() => {
    // mock asynchronous shader requests by reading from the file system
    http.get = jest.fn((url, responseType) =>
      jestGl.fromFile(url, (originalUrl) =>
        (originalUrl.indexOf('vs') > -1) ? './app/shaders/vs.glsl' : './app/shaders/fs.glsl'))

    canvas = jestGl.mockCanvas(gl, {
      width: {value: 300}, // does not indicate final PNG image size
      height: {value: 150}, // does not indicate final PNG image size
      clientWidth: {value: width}, // does not indicate final PNG image size
      clientHeight: {value: height}, // does not indicate final PNG image size
    })
  })
  it('initializes with a square and triangle', async () => {
    await app.init(canvas, gl) //start my webGL application
    let parity = await jestGl.imageParity(gl, __dirname, 'init', true, true)
    expect(parity).toBe(true)
  })
})
```

When you want to update your `.spec.png` files, set the TEST_MODE environment variable to `'update'`.
```javascript
process.env.TEST_MODE = 'update'
```
For an example of how to set up your test runner, check out [./runner.js](./runner.js). Example usage:
```bash
node runner.js # runs your tests
node runner.js -u # runs your tests but updates all .spec.png files
```

## Documentation
#### fromFile(url, pathMapFn)
> Mocks a network request by loading a local test fixture file instead.

1. _String_ **url** requested url

2. _Function_ **pathMapFn** function mapping url to a local resource

Returns a _Promise_ containing a local test fixture file or error
____________
#### mockCanvas(gl, defineProperties)
> Creates a mock canvas element to add to the mocked gl context

1. _any_ **gl** the webGL context

2. _Object_ **defineProperties** collection to map to Object.defineProperties calls
____________

#### snapshotPng(gl, imagePath, width, height)
> Takes a rendered PNG image of the glCotext

1. _any_ **gl** the webGL context

2. _String_ **imagePath** path to save the screenshot

3. _Number_ **width** in px

4. _Number_ **height** in px

Returns a _Promise_ resolving to the saved image path
____________

#### imageParity(gl, dirName, imageName, strict = true, errorDiff = true)
> Tests that two glContexts are the same. If found, differences are highlighted in a diff image.

1. _any_ **gl** the webGL context

2. _String_ **dirName** the image comparison directory

3. _String_ **imageName** the name of the image sans postfix and extension (test.spec.js => 'test')

4. _boolean_ **strict** do strict comparison (default = true)

5. _boolean_ **errorDiff** save a diff image on error (default = true)
____________

## Tips
- `jest-gl` creates and deletes intermediate files. Best to ignore `*.head.png` and `*.diff.png` from source control.

## Development Setup
```bash
npm install
npm run build
npm run test
npm run test:watch
```

