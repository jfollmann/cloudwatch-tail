const { info } = require('simple-output')
const { fromIni: AWSLoadProfileFromIni } = require('@aws-sdk/credential-providers')
const { CloudWatchLogs } = require('@aws-sdk/client-cloudwatch-logs')
const { getLoader } = require('./utils')

const configureAWSCredentials = (profile, region) => {
  const credentials = AWSLoadProfileFromIni({ profile })

  return {
    credentials,
    cloudWatchService: new CloudWatchLogs({ region, credentials })
  }
}

const loadLogGroups = async (cloudWatchService) => {
  const result = []
  let nextToken = null
  const loaderLogGroups = getLoader('Loading AWS Log Groups').start()
  do {
    const logGroupsResponse = await cloudWatchService.describeLogGroups({ limit: 50, nextToken })

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
    })

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
