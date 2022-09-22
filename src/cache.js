const loadCachedValues = (cacheService, cacheKey) => {
  const cacheValue = cacheService.get(cacheKey)
  if (!cacheValue) return { }
  return JSON.parse(cacheValue)
}

const setCacheValues = (cacheService, cacheKey, cacheValue) => {
  cacheService.set(cacheKey, JSON.stringify(cacheValue))
  cacheService.fsDump()
}

module.exports = {
  loadCachedValues,
  setCacheValues
}
