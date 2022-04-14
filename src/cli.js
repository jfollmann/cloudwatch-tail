#!/usr/bin/env node

'use strict'

const { warn, node } = require('simple-output')
const { loadCachedValues, setCacheValues } = require('./cache')
const { checkVersion, configureCommander, prompts } = require('./utils')
const { tailLog, configureAWSCredentials, loadLogGroups } = require('./aws')

const reRun = () => {
  const { profile, region, logGroupName } = loadCachedValues()

  if (!profile || !region || !logGroupName) {
    warn('Cache not found. Running interactive mode')
    return runInterative()
  }

  console.log({ profile, region, logGroupName })
  const { cloudWatchService } = configureAWSCredentials(profile, region)
  tailLog(cloudWatchService, logGroupName)
}

const runInterative = async () => {
  const { profile: profileCached, region: regionCached } = loadCachedValues()
  const { profile, region } = await prompts.first(profileCached, regionCached)

  const { cloudWatchService } = configureAWSCredentials(profile, region)
  const logGroups = await loadLogGroups(cloudWatchService)

  const { logGroupName } = await prompts.second(logGroups)

  setCacheValues(profile, region, logGroupName)
  tailLog(cloudWatchService, logGroupName)
}

const main = async () => {
  node('CloudWatchTail (CWT)')
  await checkVersion()

  if (process.env.CWT_RERUN) { return reRun() }

  const { opts } = configureCommander()
  opts.rerun ? reRun() : runInterative()
}

main()
