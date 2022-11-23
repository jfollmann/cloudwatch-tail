const { info } = require('simple-output')
const AWS = require('aws-sdk')
const { getLoader } = require('./utils')

const configureAWSCredentials = (profile, region) => {
  const credentials = new AWS.SharedIniFileCredentials({ profile })
  AWS.config.credentials = credentials

  return {
    credentials,
    cloudWatchService: new AWS.CloudWatchLogs({ region })
  }
}

const loadLogGroups = async (cloudWatchService) => {
  const result = []
  let nextToken = null
  const loaderLogGroups = getLoader('Loading AWS Log Groups').start()
  do {
    const logGroupsResponse = await cloudWatchService.describeLogGroups({ limit: 50, nextToken }).promise()

    result.push(...logGroupsResponse.logGroups)
    nextToken = logGroupsResponse.nextToken
  } while (nextToken)

  loaderLogGroups.stop()
  return result.map(({ logGroupName: name }) => ({ name }))
}

const tailLog = async (cloudWatchService, logGroupName, interval = 3000) => {
  info(`Watching '${logGroupName}' logs`)
  let nextToken = null
  let startTime = Date.now()
  const filterLogs = async () => {
    const { events, nextToken: nextTokenResponse } = await cloudWatchService.filterLogEvents({
      logGroupName,
      interleaved: false,
      startTime,
      nextToken
    }).promise()

    events.forEach(({ message }) => console.log(message))

    nextToken = nextTokenResponse
    startTime = events[events.length - 1]?.timestamp + 1 || startTime
  }

  setInterval(filterLogs, interval, startTime)
}

module.exports = {
  configureAWSCredentials,
  loadLogGroups,
  tailLog
}
