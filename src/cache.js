const Cache = require('lru-cache-fs')

const cache = new Cache({ max: 10, cacheName: 'cwt-rerun-cache' })

const loadCachedValues = () => {
  const profile = cache.get('profile')
  const region = cache.get('region')
  const logGroupName = cache.get('logGroupName')

  return { profile, region, logGroupName }
}

const setCacheValues = (profile, region, logGroupName) => {
  cache.set('profile', profile)
  cache.set('region', region)
  cache.set('logGroupName', logGroupName)
  cache.fsDump()
}

module.exports = {
  cache,
  loadCachedValues,
  setCacheValues
}
