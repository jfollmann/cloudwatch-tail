const { loadCachedValues, setCacheValues, dumpCacheValues } = require('../src/cache')

describe('Cache Spec', () => {
  const cacheKey = 'any-key'
  const profile = 'any-profile'
  const region = 'any-region'
  const logGroupName = 'any-log-group'
  const cacheValue = { profile, region, logGroupName }
  let get
  let set
  let fsDump
  let dump
  let cacheService

  beforeEach(() => {
    get = jest.fn((_) => JSON.stringify(cacheValue))
    set = jest.fn((_, value) => value)
    fsDump = jest.fn()
    dump = jest.fn().mockImplementation(() => ([{ k: cacheKey, v: JSON.stringify(cacheValue) }]))
    cacheService = { get, set, dump, fsDump }
  })

  describe('Load Cache Values', () => {
    test('Should call with correct params', () => {
      const sut = loadCachedValues(cacheService, cacheKey)

      expect(sut).toEqual(cacheValue)
      expect(get).toHaveBeenCalledTimes(1)
      expect(get.mock.calls).toEqual([
        [cacheKey]
      ])
    })

    test('Should call with invalid cacheKey', () => {
      get.mockImplementationOnce(() => undefined)
      const sut = loadCachedValues(cacheService, 'invalid-key')

      expect(sut).toEqual({})
      expect(get).toHaveBeenCalledTimes(1)
      expect(get.mock.calls).toEqual([
        ['invalid-key']
      ])
    })
  })

  describe('Set Cache Values', () => {
    test('Should call with correct params', () => {
      setCacheValues(cacheService, cacheKey, cacheValue)

      expect(set).toHaveBeenCalledTimes(1)
      expect(set.mock.calls).toEqual([
        [cacheKey, JSON.stringify(cacheValue)]
      ])
    })
  })

  describe('Dump Cache Values', () => {
    test('Should call with correct params', () => {
      const values = dumpCacheValues(cacheService, 'any_ignore_key')

      expect(dump).toHaveBeenCalledTimes(1)
      expect(values).toEqual([{ key: cacheKey, profile, region, logGroupName }])
    })

    test('Should call with ignore keys', () => {
      const values = dumpCacheValues(cacheService, cacheKey)

      expect(dump).toHaveBeenCalledTimes(1)
      expect(values).toEqual([])
    })
  })
})
