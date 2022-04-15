const { loadCachedValues, setCacheValues } = require('../src/cache')

describe('Cache Spec', () => {
  const profile = 'any_profile'
  const region = 'any_region'
  const logGroupName = 'any_log_group'

  const values = { profile, region, logGroupName }
  const get = jest.fn((key) => values[key])
  const set = jest.fn((key, value) => { values[key] = value })
  const fsDump = jest.fn()
  const cacheService = { get, set, fsDump }

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
