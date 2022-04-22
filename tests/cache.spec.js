const { loadCachedValues, setCacheValues } = require('../src/cache')

describe('Cache Spec', () => {
  const profile = 'any-profile'
  const region = 'any-region'
  const logGroupName = 'any-log-group'
  const values = { profile, region, logGroupName }
  let get
  let set
  let fsDump
  let cacheService

  beforeEach(() => {
    get = jest.fn((key) => values[key])
    set = jest.fn((key, value) => { values[key] = value })
    fsDump = jest.fn()
    cacheService = { get, set, fsDump }
  })

  test('Load Cached Values: Should call with correct params', () => {
    const sut = loadCachedValues(cacheService)

    expect(sut).toEqual(values)
    expect(get).toHaveBeenCalledTimes(3)
    expect(get.mock.calls).toEqual([
      ['profile'], ['region'], ['logGroupName']
    ])
  })

  test('Set Cache Values: Should call with correct params', () => {
    setCacheValues({ cacheService, profile, region, logGroupName })

    expect(set).toHaveBeenCalledTimes(3)
    expect(set.mock.calls).toEqual([
      ['profile', profile],
      ['region', region],
      ['logGroupName', logGroupName]
    ])
  })
})
