const { prompts, configureCommander, checkVersion, adaptAWSRegions, handlerRegions, handlerLogGroups } = require('../src/utils')
const childProcess = require('child_process')
const { warn } = require('simple-output')
const pkg = require('../package.json')

jest.mock('child_process')
jest.mock('inquirer', () => ({
  prompt: jest.fn((itens) => itens.map(({ type, name, source }) => ({ type, name, source }))),
  registerPrompt: jest.fn()
}))

jest.mock('commander', () => ({
  option: jest.fn().mockReturnThis(),
  version: jest.fn().mockReturnThis(),
  parse: jest.fn().mockReturnThis(),
  opts: jest.fn().mockReturnValue({ rerun: false })
}))
jest.mock('simple-output')

describe('Utils Spec', () => {
  const logGroups = [{ name: 'any-log-group-name-1' }, { name: 'any-log-group-name-2' }]
  const firstPromptExpected = [{ type: 'input', name: 'profile', source: undefined }, { type: 'autocomplete', name: 'region', source: expect.any(Function) }]
  const secondPromptExpected = [{ type: 'autocomplete', name: 'logGroupName', source: expect.any(Function) }]
  const regionName = 'any-region-name'
  const regionCode = 'any-region-code'
  const regions = [{ name: regionName, code: regionCode }]

  test('Adapt AWS Regions', () => {
    const sut = adaptAWSRegions(regions)

    expect(sut).toEqual([{ name: `${regionName} (${regionCode})`, value: regionCode }])
  })

  describe('Handler Regions', () => {
    test('Should call with correct params', () => {
      const sut = handlerRegions(undefined, 'us-east-1')

      expect(sut).toEqual([{ name: 'N. Virginia (us-east-1)', value: 'us-east-1' }])
    })

    test('Should call with wrong params', () => {
      const sut = handlerRegions(undefined, 'value-not-found')

      expect(sut).toEqual([])
    })
  })

  describe('Handler Log Groups', () => {
    test('Should call with correct params: filter contains', () => {
      const sut = handlerLogGroups(logGroups, undefined, 'any-log')

      expect(sut).toEqual(logGroups)
    })

    test('Should call with correct params: filter only one', () => {
      const [, expected] = logGroups

      const sut = handlerLogGroups(logGroups, undefined, 'any-log-group-name-2')

      expect(sut).toEqual([expected])
    })

    test('Should call with wrong params', () => {
      const sut = handlerLogGroups(logGroups, undefined, 'value-not-found')

      expect(sut).toEqual([])
    })
  })

  test('Check first prompts list', () => {
    const sut = prompts.first()

    expect(sut).toEqual(firstPromptExpected)
  })

  test('Check second prompts list', () => {
    const sut = prompts.second(logGroups)

    expect(sut).toEqual(secondPromptExpected)
  })

  test('Configure Commander: Should call with correct params', () => {
    const sut = configureCommander()

    expect(sut).toMatchObject({
      commander: expect.any(Object),
      opts: expect.any(Object)
    })
  })

  describe('Check Version', () => {
    const [oldVersion, currentVersion, newVersion] = ['1.0.0', pkg.version, '20.0.0']

    test('Old Version: check to notify new version', async () => {
      childProcess.exec.mockImplementation((_, callback) => callback(null, { stdout: oldVersion }))

      await checkVersion()

      expect(warn.mock.calls).toEqual([
        [`Update available: ${pkg.version} => ${oldVersion}`],
        [`Run npm i -g ${pkg.name} to update\r\n`]
      ])
      expect(warn).toHaveBeenCalledTimes(2)
    })

    test('Current Version: don`t notify new version', async () => {
      childProcess.exec.mockImplementation((_, callback) => callback(null, { stdout: currentVersion }))

      await checkVersion()

      expect(warn).toHaveBeenCalledTimes(0)
    })

    test('New Version: check to notify new version', async () => {
      childProcess.exec.mockImplementation((_, callback) => callback(null, { stdout: newVersion }))

      await checkVersion()

      expect(warn.mock.calls).toEqual([
        [`Update available: ${pkg.version} => ${newVersion}`],
        [`Run npm i -g ${pkg.name} to update\r\n`]
      ])
      expect(warn).toHaveBeenCalledTimes(2)
    })
  })
})
