const cli = require('../src/cli')
const { loadCachedValues, setCacheValues } = require('../src/cache')
const { warn, node } = require('simple-output')
const { configureAWSCredentials, tailLog, loadLogGroups } = require('../src/aws')
const { prompts, configureCommander } = require('../src/utils')

jest.mock('../src/cache')
jest.mock('../src/aws')
jest.mock('../src/utils')
jest.mock('simple-output')

describe('CLI Spec', () => {
  const profile = 'any-profile'
  const region = 'any-region'
  const logGroupName = 'any-log-group-name'
  const cloudWatchService = jest.fn()
  const logGroups = [{ name: 'any-log-group' }]

  beforeEach(() => {
    loadCachedValues.mockImplementation(() => ({ profile, region, logGroupName }))
    setCacheValues.mockImplementation(() => jest.fn())
    configureAWSCredentials.mockImplementation(() => ({
      cloudWatchService
    }))
    tailLog.mockImplementation(() => jest.fn())
    prompts.selectProfileAndRegion.mockImplementation(() => ({ profile, region }))
    prompts.selectLogGroup.mockImplementation(() => ({ logGroupName }))
    loadLogGroups.mockResolvedValue(() => logGroups)
    configureCommander.mockImplementation(() => ({ opts: { rerun: false } }))
  })

  describe('Re Run', () => {
    test('Should call with correct params', async () => {
      await cli.reRun()

      expect(loadCachedValues).toHaveBeenCalledTimes(1)
      expect(warn).toHaveBeenCalledTimes(0)
      expect(configureAWSCredentials).toHaveBeenCalledTimes(1)
      expect(configureAWSCredentials).toHaveBeenCalledWith(profile, region)
      expect(tailLog).toHaveBeenCalledTimes(1)
      expect(tailLog).toHaveBeenCalledWith(cloudWatchService, logGroupName)
    })

    test('Should call without cache', async () => {
      loadCachedValues.mockImplementationOnce(() => ({ profile: undefined }))

      await cli.reRun()

      expect(loadCachedValues).toHaveBeenCalledTimes(2)
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn).toHaveBeenCalledWith('Cache not found. Running interactive mode')
    })
  })

  describe('Run Interactive', () => {
    test('Should call with correct params', async () => {
      await cli.runInterative()

      expect(loadCachedValues).toHaveBeenCalledTimes(1)
      expect(configureAWSCredentials).toHaveBeenCalledTimes(1)
      expect(loadLogGroups).toHaveBeenCalledTimes(1)
      expect(setCacheValues).toHaveBeenCalledTimes(1)
      expect(tailLog).toHaveBeenCalledTimes(1)
      expect(tailLog).toHaveBeenCalledWith(cloudWatchService, logGroupName)
    })
  })

  describe('Run', () => {
    test('Should call with with runInterative operation', async () => {
      await cli.run()

      expect(node).toHaveBeenCalledTimes(1)
      expect(loadCachedValues).toHaveBeenCalledTimes(1)
    })

    test('Should call with with reRun operation', async () => {
      configureCommander.mockImplementation(() => ({ opts: { rerun: true } }))

      await cli.run()

      expect(loadCachedValues).toHaveBeenCalledTimes(1)
      expect(loadCachedValues).toHaveBeenCalledTimes(1)
    })

    test('Should call with with environment reRun operation', async () => {
      process.env.CWT_RERUN = true
      await cli.run()

      expect(loadCachedValues).toHaveBeenCalledTimes(1)
      expect(loadCachedValues).toHaveBeenCalledTimes(1)
    })
  })
})
