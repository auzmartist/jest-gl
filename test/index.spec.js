let jestGl = require('../index.js')()

describe('jest-gl tests', () => {
	it('is an object containing helper functions', () => expect(jestGl).toBeTruthy())
	it('exposes a fromFile function', () => expect(jestGl.fromFile).toBeDefined())
	it('exposes a mockCanvas function', () => expect(jestGl.mockCanvas).toBeDefined())
	it('exposes a snapshotPng function', () => expect(jestGl.snapshotPng).toBeDefined())
	it('exposes an imageParity function', () => expect(jestGl.imageParity).toBeDefined())
})