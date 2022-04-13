#!/usr/bin/env node

"use strict"

const AWS = require('aws-sdk')
const Cache = require('lru-cache-fs')
const inquirer = require('inquirer')
const out = require('simple-output')
const commander = require('commander')
const { list: listAwsRegions } = require('aws-regions')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

const cache = new Cache({
  max: 10,
  cacheName: 'acw-rerun-cache'
})

const tailLog = async (cloudWatchService, logGroupName, interval = 1000) => {
  out.info(`Watching '${logGroupName}' logs`)
  const filterLogs = async ({ startTime }) => {
    const { events } = await cloudWatchService.filterLogEvents({
      logGroupName,
      interleaved: false,
      startTime
    }).promise()

    events.forEach(({ message }) => console.log(message))

    setTimeout(filterLogs, interval, { startTime: events[events.length - 1]?.timestamp + 1 || startTime })
  }

  filterLogs({ startTime: Date.now() })
}

const loadLogGroups = async (cloudWatchService) => {
  const { logGroups } = await cloudWatchService.describeLogGroups().promise()

  return logGroups.map(({ logGroupName: name }) => ({ name }))
}

const configureCommander = () => {
  commander
    .option('-r, --rerun', 'Re run', false)
    .version('0.0.3', '-v, --version')
    .parse(process.argv)

  return { commander, opts: commander.opts() }
}

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

const configureAWSCredentials = (profile, region) => {
  const credentials = new AWS.SharedIniFileCredentials({ profile })
  AWS.config.credentials = credentials

  return {
    credentials,
    cloudWatchService: new AWS.CloudWatchLogs({ region })
  }
}

const reRun = () => {
  const { profile, region, logGroupName } = loadCachedValues()

  if (!profile || !region || !logGroupName) {
    out.warn('Cache not found. Running interactive mode')
    return runInterative()
  }

  console.log({ profile, region, logGroupName })
  const { cloudWatchService } = configureAWSCredentials(profile, region)
  tailLog(cloudWatchService, logGroupName)
}

const runInterative = async () => {
  const { profile, region } = await inquirer.prompt([
    {
      message: 'AWS profile name',
      type: 'input',
      name: 'profile',
      default: 'default'
    },
    {
      message: 'AWS region',
      type: 'autocomplete',
      name: 'region',
      default: 'us-east-1',
      source: (_, input) => {
        const regions = listAwsRegions().map(({ name, code }) => ({ name: `${name} (${code})`, value: code }))

        return input
          ? regions.filter((item) => item.name.toLocaleLowerCase().includes(input) || item.value.toLocaleLowerCase().includes(input))
          : regions
      }
    }
  ])

  const { cloudWatchService } = configureAWSCredentials(profile, region)
  const logGroups = await loadLogGroups(cloudWatchService)

  const { logGroupName } = await inquirer.prompt([
    {
      message: 'AWS log group name',
      type: 'autocomplete',
      name: 'logGroupName',
      source: (_, input) => {
        return input
          ? logGroups.filter((item) => item.name.toLocaleLowerCase().includes(input))
          : logGroups
      }
    }
  ])

  setCacheValues(profile, region, logGroupName)
  tailLog(cloudWatchService, logGroupName)
}

const main = async () => {
  out.node(`CloudWatchTail (CWT)`)

  if(process.env.CWT_RERUN)
    return reRun()

  const { opts } = configureCommander();
  opts.rerun ? reRun() : runInterative()
}

main()