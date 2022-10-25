const loadCachedValues = (cacheService, cacheKey) => {
  const cacheValue = cacheService.get(cacheKey)
  if (!cacheValue) return {}
  return JSON.parse(cacheValue)
}

const setCacheValues = (cacheService, cacheKey, cacheValue) => {
  cacheService.set(cacheKey, JSON.stringify(cacheValue))
  cacheService.fsDump()
}

const dumpCacheValues = (cacheService, ignoreKey) => {
  return cacheService.dump()
    .map((entry) => {
      const { k: key, v: value } = entry
      const { profile, region, logGroupName } = JSON.parse(value)
      return { key, profile, region, logGroupName }
    })
    .filter(({ key }) => key !== ignoreKey)
}

module.exports = {
  loadCachedValues,
  setCacheValues,
  dumpCacheValues
}
