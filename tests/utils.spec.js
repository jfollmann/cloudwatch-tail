const { prompts, configureCommander, checkVersion, adaptAWSRegions, handlerRegions, handlerLogGroups, getLoader } = require('../src/utils')
const pkg = require('../package.json')

const { list: listAwsRegions } = require('aws-regions')
const childProcess = require('child_process')
const { hint } = require('simple-output')

jest.mock('simple-output')
jest.mock('child_process')
jest.mock('aws-regions')
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

describe('Utils Spec', () => {
  const [logGroupNameOne, logGroupNameTwo] = ['any-log-group-name-1', 'any-log-group-name-2']
  const logGroups = [{ name: logGroupNameOne }, { name: logGroupNameTwo }]
  const firstPromptExpected = [{ type: 'input', name: 'profile', source: undefined }, { type: 'autocomplete', name: 'region', source: expect.any(Function) }]
  const secondPromptExpected = [{ type: 'autocomplete', name: 'logGroupName', source: expect.any(Function) }]
  const [regionNameOne, regionNameTwo] = ['any-region-name-one', 'any-region-name-two']
  const [regionCodeOne, regionCodeTwo] = ['any-region-code-one', 'any-region-code-one']
  const regions = [{ name: regionNameOne, code: regionCodeOne }, { name: regionNameTwo, code: regionCodeTwo }]

  beforeEach(() => {
    listAwsRegions.mockReturnValue(regions)
  })

  test('Adapt AWS Regions', () => {
    const sut = adaptAWSRegions(regions)

    expect(sut).toEqual([
      { name: `${regionNameOne} (${regionCodeOne})`, value: regionCodeOne },
      { name: `${regionNameTwo} (${regionCodeTwo})`, value: regionCodeTwo }
    ])
  })

  describe('Handler Regions', () => {
    test('Should call with found value', () => {
      const sut = handlerRegions(undefined, regionNameOne)

      expect(sut).toEqual([{ name: `${regionNameOne} (${regionCodeOne})`, value: regionCodeOne }])
    })

    test('Should call with not found value', () => {
      const sut = handlerRegions(undefined, 'not-found-name')

      expect(sut).toEqual([])
    })

    test('Should call with undefined value', () => {
      const sut = handlerRegions(undefined, undefined)

      expect(sut).toEqual([
        { name: `${regionNameOne} (${regionCodeOne})`, value: regionCodeOne },
        { name: `${regionNameTwo} (${regionCodeTwo})`, value: regionCodeTwo }
      ])
    })
  })

  describe('Handler Log Groups', () => {
    test('Should call with found value', () => {
      const sut = handlerLogGroups(logGroups, undefined, 'any-log')

      expect(sut).toEqual(logGroups)
    })

    test('Should call with correct params: filter only one', () => {
      const [, expected] = logGroups

      const sut = handlerLogGroups(logGroups, undefined, 'any-log-group-name-2')

      expect(sut).toEqual([expected])
    })

    test('Should call with not found value', () => {
      const sut = handlerLogGroups(logGroups, undefined, 'value-not-found')

      expect(sut).toEqual([])
    })

    test('Should call with undefined value', () => {
      const sut = handlerLogGroups(logGroups, undefined, undefined)

      expect(sut).toEqual(logGroups)
    })
  })

  test('Check selectProfileAndRegion prompt list', () => {
    const sut = prompts.selectProfileAndRegion()

    expect(sut).toEqual(firstPromptExpected)
  })

  test('Check selectLogGroup prompt list', () => {
    const sut = prompts.selectLogGroup(logGroups)

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

      expect(hint.mock.calls).toEqual([
        [`Update available: ${pkg.version} => ${oldVersion}`],
        [`Run npm i -g ${pkg.name} to update\r\n`]
      ])
      expect(hint).toHaveBeenCalledTimes(2)
    })

    test('Current Version: don`t notify new version', async () => {
      childProcess.exec.mockImplementation((_, callback) => callback(null, { stdout: currentVersion }))

      await checkVersion()

      expect(hint).toHaveBeenCalledTimes(0)
    })

    test('New Version: check to notify new version', async () => {
      childProcess.exec.mockImplementation((_, callback) => callback(null, { stdout: newVersion }))

      await checkVersion()

      expect(hint.mock.calls).toEqual([
        [`Update available: ${pkg.version} => ${newVersion}`],
        [`Run npm i -g ${pkg.name} to update\r\n`]
      ])
      expect(hint).toHaveBeenCalledTimes(2)
    })
  })

  describe('Get Loader', () => {
    const loaderText = 'any-loader-text'
    test('Should call with text only', () => {
      const sut = getLoader(loaderText)

      expect(sut).toMatchObject({
        options: {
          text: loaderText,
          color: 'yellow'
        }
      })
    })

    test('Should call with text and color', () => {
      const sut = getLoader(loaderText, 'red')

      expect(sut).toMatchObject({
        options: {
          text: loaderText,
          color: 'red'
        }
      })
    })
  })
})
