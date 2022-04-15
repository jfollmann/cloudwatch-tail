const loadCachedValues = (cacheService) => {
  const profile = cacheService.get('profile')
  const region = cacheService.get('region')
  const logGroupName = cacheService.get('logGroupName')

  return { profile, region, logGroupName }
}

const setCacheValues = ({ cacheService, profile, region, logGroupName }) => {
  cacheService.set('profile', profile)
  cacheService.set('region', region)
  cacheService.set('logGroupName', logGroupName)
  cacheService.fsDump()
}

module.exports = {
  loadCachedValues,
  setCacheValues
}
