const { configureAWSCredentials, loadLogGroups, tailLog } = require('../src/aws')
const { getLoader } = require('../src/utils')

const { CloudWatchLogs } = require('aws-sdk')
const AWS = require('aws-sdk')

jest.mock('aws-sdk')
jest.mock('../src/utils')

describe('AWS Spec', () => {
  const profile = 'any-profile'
  const region = 'any-region'
  const [logGroupNameOne, logGroupNameTwo] = ['any-log-group-one', 'any-log-group-two']
  const nextToken = 'any-next-token'
  const describeLogGroupValueOne = { logGroups: [{ logGroupName: logGroupNameOne }], nextToken }
  const describeLogGroupValueTwo = { logGroups: [{ logGroupName: logGroupNameTwo }], nextToken: null }
  const describeLogGroupsPromise = jest.fn()
    .mockResolvedValueOnce(describeLogGroupValueOne)
    .mockResolvedValueOnce(describeLogGroupValueTwo)
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

  describe('Load Log Groups', () => {
    const loaderStop = jest.fn()
    const loaderStart = jest.fn().mockImplementation(() => ({ stop: loaderStop }))

    beforeEach(() => {
      getLoader.mockImplementation(() => ({ start: loaderStart }))
    })

    test('Load Log Groups: Should call with correct params', async () => {
      const sut = await loadLogGroups(cloudWatchService)

      expect(loaderStart).toHaveBeenCalledTimes(1)
      expect(loaderStop).toHaveBeenCalledTimes(1)
      expect(describeLogGroups).toHaveBeenCalled()
      expect(describeLogGroups).toHaveBeenCalledTimes(2)
      expect(describeLogGroups.mock.calls).toEqual([
        [{ limit: 50, nextToken: null }],
        [{ limit: 50, nextToken }]
      ])
      expect(describeLogGroupsPromise).toHaveBeenCalled()
      expect(describeLogGroupsPromise).toHaveBeenCalledTimes(2)
      expect(sut).toEqual([{ name: logGroupNameOne }, { name: logGroupNameTwo }])
    })
  })

  test('Tail Log: Should call with correct params', async () => {
    jest.useFakeTimers()

    await tailLog(cloudWatchService, logGroupNameOne)

    expect(filterLogEvents).toHaveBeenCalledWith({ interleaved: false, logGroupName: logGroupNameOne, startTime: expect.any(Number) })
    expect(filterLogEvents).toHaveBeenCalledTimes(1)
  })
})
