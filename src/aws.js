const { info } = require('simple-output')
const { SharedIniFileCredentials, CloudWatchLogs, config } = require('aws-sdk')

const configureAWSCredentials = (profile, region) => {
  const credentials = new SharedIniFileCredentials({ profile })
  config.credentials = credentials

  return {
    credentials,
    cloudWatchService: new CloudWatchLogs({ region })
  }
}

const loadLogGroups = async (cloudWatchService) => {
  const { logGroups } = await cloudWatchService.describeLogGroups().promise()

  return logGroups.map(({ logGroupName: name }) => ({ name }))
}

const tailLog = async (cloudWatchService, logGroupName, interval = 1000) => {
  info(`Watching '${logGroupName}' logs`)
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

module.exports = {
  configureAWSCredentials,
  loadLogGroups,
  tailLog
}