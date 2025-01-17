const cli = require('../src/cli')
const fs = require('fs')
const { loadCachedValues, setCacheValues, dumpCacheValues } = require('../src/cache')
const { configureAWSCredentials, tailLog, loadLogGroups } = require('../src/aws')
const { prompts, configureCommander } = require('../src/utils')

const { warn, node, success, error } = require('simple-output')

jest.mock('../src/cache')
jest.mock('../src/aws')
jest.mock('../src/utils')
jest.mock('simple-output')
jest.mock('fs')
jest.mock('@aws-sdk/credential-providers', () => jest.fn())
jest.mock('@aws-sdk/client-cloudwatch-logs', () => jest.fn())

describe('CLI Spec', () => {
  const profile = 'any-profile'
  const region = 'any-region'
  const logGroupName = 'any-log-group-name'
  const logGroups = [{ name: 'any-log-group' }]
  const aliasSaved = [{ key: 'any-key', profile: 'any_profile', region: 'any_region', logGroupName: 'any-log-group' }]
  let cloudWatchService

  beforeEach(() => {
    delete process.env.CWT_RERUN
    cloudWatchService = jest.fn()
    loadCachedValues.mockImplementation(() => ({ profile, region, logGroupName }))
    setCacheValues.mockImplementation(() => jest.fn())
    dumpCacheValues.mockImplementation(() => aliasSaved)
    configureAWSCredentials.mockImplementation(() => ({
      cloudWatchService
    }))
    tailLog.mockImplementation(() => jest.fn())
    prompts.selectProfileAndRegion.mockImplementation(() => ({ profile, region }))
    prompts.selectLogGroup.mockImplementation(() => ({ logGroupName }))
    prompts.selectCacheKey.mockImplementation(() => ({ }))
    loadLogGroups.mockResolvedValue(() => logGroups)
    configureCommander.mockImplementation(() => ({ opts: { rerun: false } }))
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(JSON.stringify(aliasSaved))
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

    test('Should call with correct params with save tail', async () => {
      prompts.selectCacheKey.mockImplementationOnce(() => ({ savedCacheKey: 'any-key' }))

      await cli.runInterative()

      expect(loadCachedValues).toHaveBeenCalledTimes(1)
      expect(success).toHaveBeenCalledTimes(1)
      expect(configureAWSCredentials).toHaveBeenCalledTimes(1)
      expect(loadLogGroups).toHaveBeenCalledTimes(1)
      expect(setCacheValues).toHaveBeenCalledTimes(2)
      expect(tailLog).toHaveBeenCalledTimes(1)
      expect(tailLog).toHaveBeenCalledWith(cloudWatchService, logGroupName)
    })
  })

  describe('Run', () => {
    test('Should call with runInterative operation', async () => {
      await cli.run()

      expect(node).toHaveBeenCalledTimes(1)
      expect(loadCachedValues).toHaveBeenCalledTimes(1)
    })

    test('Should call with reRun operation', async () => {
      configureCommander.mockImplementationOnce(() => ({ opts: { rerun: true } }))

      await cli.run()

      expect(loadCachedValues).toHaveBeenCalledTimes(1)
    })

    test('Should call with environment reRun operation', async () => {
      process.env.CWT_RERUN = true

      await cli.run()

      expect(loadCachedValues).toHaveBeenCalledTimes(1)
    })
  })

  describe('List all alias', () => {
    test('Should call run with list all alias operation', async () => {
      configureCommander.mockImplementationOnce(() => ({ opts: { listAlias: true } }))

      await cli.run()

      expect(dumpCacheValues).toHaveBeenCalledTimes(1)
    })
  })

  describe('Export aliases', () => {
    test('Should call run with export aliases operation', async () => {
      configureCommander.mockImplementationOnce(() => ({ opts: { export: true } }))

      await cli.run()

      expect(dumpCacheValues).toHaveBeenCalledTimes(1)
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
      expect(success).toHaveBeenCalledTimes(1)
    })
  })

  describe('Import aliases', () => {
    const file = 'file.json'

    test('Should call run with import aliases operation with correct file path', async () => {
      configureCommander.mockImplementationOnce(() => ({ opts: { import: file } }))

      await cli.run()

      expect(setCacheValues).toHaveBeenCalledTimes(1)
      expect(success).toHaveBeenCalledTimes(1)
    })

    test('Should call run with import: aliases operation with wrong file path', async () => {
      configureCommander.mockImplementationOnce(() => ({ opts: { import: file } }))
      fs.existsSync.mockReturnValueOnce(false)

      await cli.run()

      expect(setCacheValues).toHaveBeenCalledTimes(0)
      expect(error).toHaveBeenCalledTimes(1)
    })
  })
})
