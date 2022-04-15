const { CloudWatchLogs } = require('aws-sdk')
const AWS = require('aws-sdk')
const { configureAWSCredentials, loadLogGroups, tailLog } = require('../src/aws')

jest.mock('aws-sdk')

describe('AWS Spec', () => {
  const profile = 'any_profile'
  const region = 'any_region'
  const logGroupName = 'any_log_group'
  const describeLogGroupValue = { logGroups: [{ logGroupName }] }
  const describeLogGroupsPromise = jest.fn().mockResolvedValue(describeLogGroupValue)
  const describeLogGroups = jest.fn(() => ({
    promise: describeLogGroupsPromise
  }))
  const filterLogEventsValue = { events: [{ message: 'log-event-001' }] }
  const filterLogEventsPromise = jest.fn().mockResolvedValue(filterLogEventsValue)
  const filterLogEvents = jest.fn(() => ({
    promise: filterLogEventsPromise
  }))
  const cloudWatchService = { describeLogGroups, filterLogEvents }

  test('Configure AWS Credentials: Should call with correct params', () => {
    const sut = configureAWSCredentials(profile, region)

    expect(sut).toMatchObject({
      credentials: expect.any(Object),
      cloudWatchService: expect.any(CloudWatchLogs)
    })
    expect(AWS.SharedIniFileCredentials).toHaveBeenCalledTimes(1)
    expect(AWS.SharedIniFileCredentials).toHaveBeenCalledWith({ profile })
    expect(AWS.CloudWatchLogs).toHaveBeenCalledTimes(1)
    expect(AWS.CloudWatchLogs).toHaveBeenCalledWith({ region })
  })

  test('Load Log Groups: Should call with correct params', async () => {
    const sut = await loadLogGroups(cloudWatchService)

    expect(describeLogGroups).toHaveBeenCalled()
    expect(describeLogGroups).toHaveBeenCalledTimes(1)
    expect(describeLogGroupsPromise).toHaveBeenCalled()
    expect(describeLogGroupsPromise).toHaveBeenCalledTimes(1)
    expect(sut).toEqual([{ name: logGroupName }])
  })

  test('Tail Log: Should call with correct params', async () => {
    jest.useFakeTimers()

    await tailLog(cloudWatchService, logGroupName)

    expect(filterLogEvents).toHaveBeenCalledWith({ interleaved: false, logGroupName, startTime: expect.any(Number) })
    expect(filterLogEvents).toHaveBeenCalledTimes(1)
  })
})
