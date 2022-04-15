const { warn, node } = require('simple-output')
const { loadCachedValues, setCacheValues } = require('./cache')
const { checkVersion, configureCommander, prompts } = require('./utils')
const { tailLog, configureAWSCredentials, loadLogGroups } = require('./aws')
const Cache = require('lru-cache-fs')

const cacheService = new Cache({ max: 10, cacheName: 'cwt-rerun-cache' })

const reRun = async () => {
  const { profile, region, logGroupName } = loadCachedValues(cacheService)

  if (!profile || !region || !logGroupName) {
    warn('Cache not found. Running interactive mode')
    return await runInterative()
  }

  console.log({ profile, region, logGroupName })
  const { cloudWatchService } = configureAWSCredentials(profile, region)
  tailLog(cloudWatchService, logGroupName)
}

const runInterative = async () => {
  const { profile: profileCached, region: regionCached } = loadCachedValues(cacheService)
  const { profile, region } = await prompts.first(profileCached, regionCached)

  const { cloudWatchService } = configureAWSCredentials(profile, region)
  const logGroups = await loadLogGroups(cloudWatchService)

  const { logGroupName } = await prompts.second(logGroups)

  setCacheValues({ cacheService, profile, region, logGroupName })
  tailLog(cloudWatchService, logGroupName)
}

const run = async () => {
  node('CloudWatchTail (CWT)')
  await checkVersion()

  if (process.env.CWT_RERUN) { return reRun() }

  const { opts } = configureCommander()
  opts.rerun ? reRun() : runInterative()
}

module.exports = {
  cacheService,
  reRun,
  runInterative,
  run
}
