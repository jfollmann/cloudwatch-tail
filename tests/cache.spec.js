const { loadCachedValues, setCacheValues } = require('../src/cache')

describe('Cache Spec', () => {
  const cacheKey = 'any-key'
  const profile = 'any-profile'
  const region = 'any-region'
  const logGroupName = 'any-log-group'
  const cacheValue = { profile, region, logGroupName }
  let get
  let set
  let fsDump
  let cacheService

  beforeEach(() => {
    get = jest.fn((_) => JSON.stringify(cacheValue))
    set = jest.fn((key, value) => value)
    fsDump = jest.fn()
    cacheService = { get, set, fsDump }
  })

  test('Load Cached Values: Should call with correct params', () => {
    const sut = loadCachedValues(cacheService, cacheKey)

    expect(sut).toEqual(cacheValue)
    expect(get).toHaveBeenCalledTimes(1)
    expect(get.mock.calls).toEqual([
      [cacheKey]
    ])
  })

  test('Load Cached Values: Should call with invalidt cacheKey', () => {
    get.mockImplementationOnce(() => undefined)
    const sut = loadCachedValues(cacheService, 'invalid-key')

    expect(sut).toEqual({})
    expect(get).toHaveBeenCalledTimes(1)
    expect(get.mock.calls).toEqual([
      ['invalid-key']
    ])
  })

  test('Set Cache Values: Should call with correct params', () => {
    setCacheValues(cacheService, cacheKey, cacheValue)

    expect(set).toHaveBeenCalledTimes(1)
    expect(set.mock.calls).toEqual([
      [cacheKey, JSON.stringify(cacheValue)]
    ])
  })
})
