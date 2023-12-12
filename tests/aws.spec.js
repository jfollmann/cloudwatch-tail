const { configureAWSCredentials, loadLogGroups, tailLog } = require('../src/aws')
const { getLoader } = require('../src/utils')

const { fromIni: AWSLoadProfileFromIni } = require('@aws-sdk/credential-providers')
const { CloudWatchLogs } = require('@aws-sdk/client-cloudwatch-logs')

jest.mock('@aws-sdk/credential-providers')
jest.mock('@aws-sdk/client-cloudwatch-logs')
jest.mock('../src/utils')

describe('AWS Spec', () => {
  describe('Configure AWS Credentials', () => {
    const profile = 'any-profile'
    const region = 'any-region'

    test('Should call with correct params', () => {
      const sut = configureAWSCredentials(profile, region)

      expect(sut).toEqual(
        expect.objectContaining({
          cloudWatchService: expect.any(CloudWatchLogs)
        })
      )
      expect(AWSLoadProfileFromIni).toHaveBeenCalledTimes(1)
      expect(AWSLoadProfileFromIni).toHaveBeenCalledWith({ profile })
      expect(CloudWatchLogs).toHaveBeenCalledTimes(1)
      expect(CloudWatchLogs).toHaveBeenCalledWith({ region })
    })
  })

  describe('Log Groups & Tail Log', () => {
    const [logGroupNameOne, logGroupNameTwo] = ['any-log-group-one', 'any-log-group-two']
    const nextToken = 'any-next-token'
    const describeLogGroupValueOne = { logGroups: [{ logGroupName: logGroupNameOne }], nextToken }
    const describeLogGroupValueTwo = { logGroups: [{ logGroupName: logGroupNameTwo }], nextToken: null }
    const filterLogEventsValue = { events: [{ message: 'log-event-001' }] }
    let describeLogGroups
    let filterLogEvents
    let cloudWatchService
    let loaderStop
    let loaderStart

    beforeEach(() => {
      describeLogGroups = jest.fn()
        .mockResolvedValueOnce(describeLogGroupValueOne)
        .mockResolvedValueOnce(describeLogGroupValueTwo)
      filterLogEvents = jest.fn().mockResolvedValue(filterLogEventsValue)
      cloudWatchService = { describeLogGroups, filterLogEvents }
      loaderStop = jest.fn()
      loaderStart = jest.fn().mockImplementation(() => ({ stop: loaderStop }))
      getLoader.mockImplementation(() => ({ start: loaderStart }))
    })

    test('Should call with correct params', async () => {
      const sut = await loadLogGroups(cloudWatchService)

      expect(loaderStart).toHaveBeenCalledTimes(1)
      expect(loaderStop).toHaveBeenCalledTimes(1)
      expect(describeLogGroups).toHaveBeenCalled()
      expect(describeLogGroups).toHaveBeenCalledTimes(2)
      expect(describeLogGroups.mock.calls).toEqual([
        [{ limit: 50, nextToken: null }],
        [{ limit: 50, nextToken }]
      ])
      expect(sut).toEqual([{ name: logGroupNameOne }, { name: logGroupNameTwo }])
    })

    test('Tail Log: Should call with correct params', async () => {
      jest.useFakeTimers()

      await tailLog(cloudWatchService, logGroupNameOne)
      jest.advanceTimersByTime(3000)

      expect(filterLogEvents).toHaveBeenCalledWith({ interleaved: false, logGroupName: logGroupNameOne, nextToken: null, startTime: expect.any(Number) })
      expect(filterLogEvents).toHaveBeenCalledTimes(1)
    })
  })
})
