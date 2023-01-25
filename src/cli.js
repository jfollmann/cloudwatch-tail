const fs = require('fs')
const { loadCachedValues, setCacheValues, dumpCacheValues } = require('./cache')
const { checkVersion, configureCommander, prompts } = require('./utils')
const { tailLog, configureAWSCredentials, loadLogGroups } = require('./aws')

const { warn, node, success, error } = require('simple-output')
const Cache = require('lru-cache-fs')

const cacheService = new Cache({ max: 10, cacheName: 'cwt-cache' })
const cacheKeyRerun = 'cwt-rerun'

const reRun = async (cachedKeyAlias) => {
  const cacheKey = cachedKeyAlias || cacheKeyRerun
  const { profile, region, logGroupName } = loadCachedValues(cacheService, cacheKey)

  if (!profile || !region || !logGroupName) {
    warn('Cache not found. Running interactive mode')
    return await runInterative()
  }

  console.log({ profile, region, logGroupName })
  const { cloudWatchService } = configureAWSCredentials(profile, region)
  tailLog(cloudWatchService, logGroupName)
}

const runInterative = async () => {
  const { profile: profileCached, region: regionCached } = loadCachedValues(cacheService, cacheKeyRerun)
  const { profile, region } = await prompts.selectProfileAndRegion(profileCached, regionCached)

  const { cloudWatchService } = configureAWSCredentials(profile, region)
  const logGroups = await loadLogGroups(cloudWatchService)

  const { logGroupName } = await prompts.selectLogGroup(logGroups)
  const { savedCacheKey } = await prompts.selectCacheKey()

  setCacheValues(cacheService, cacheKeyRerun, { profile, region, logGroupName })
  if (savedCacheKey) {
    setCacheValues(cacheService, savedCacheKey, { profile, region, logGroupName })
    success(`To re run this operation with saved alias use: cwt -a ${savedCacheKey}`)
  }

  tailLog(cloudWatchService, logGroupName)
}

const showAliasList = () => {
  const itens = dumpCacheValues(cacheService, cacheKeyRerun)
  console.table(itens)
}

const exportAliases = () => {
  const fileName = 'cwt-aliases-export.json'
  const itens = dumpCacheValues(cacheService, cacheKeyRerun)
  fs.writeFileSync(fileName, JSON.stringify(itens, null, 2))
  success(`${itens.length} aliases exported with sucess. (file: ${fileName})`)
}

const importAliases = (file) => {
  if (!fs.existsSync(file)) {
    return error(`File "${file}" not found.`)
  }
  const contents = JSON.parse(fs.readFileSync(file, 'utf-8'))
  contents.forEach(({ key, profile, region, logGroupName }) => {
    setCacheValues(cacheService, key, { profile, region, logGroupName })
  })
  success(`${contents.length} aliases imported with success.`)
}

const run = async () => {
  node('CloudWatchTail (CWT)')
  await checkVersion()

  if (process.env.CWT_RERUN) { return reRun() }

  const { opts } = configureCommander()

  if (opts.listAlias) {
    return showAliasList()
  }

  if (opts.export) {
    return exportAliases()
  }

  if (opts.import) {
    return importAliases(opts.import)
  }

  opts.rerun || opts.alias ? reRun(opts.alias) : runInterative()
}

module.exports = {
  cacheService,
  reRun,
  runInterative,
  run,
  showAliasList,
  exportAliases,
  importAliases
}
