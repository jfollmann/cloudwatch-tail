const pkg = require('../package.json')

const { hint } = require('simple-output')
const { promisify } = require('util')
const { exec } = require('child_process')
const { list: listAwsRegions } = require('aws-regions')
const loader = require('loading-cli')
const commander = require('commander')
const inquirer = require('inquirer')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

const execAsync = promisify(exec)

const adaptAWSRegions = (itens) => itens.map(({ name, code }) => ({ name: `${name} (${code})`, value: code }))

const handlerRegions = (_, input) => {
  const regions = adaptAWSRegions(listAwsRegions())
  const filter = (input || '').toLocaleLowerCase()

  return input
    ? regions.filter((item) => item.name.toLocaleLowerCase().includes(filter) || item.value.toLocaleLowerCase().includes(filter))
    : regions
}

const handlerLogGroups = (logGroups, _, input) => {
  const filter = (input || '').toLocaleLowerCase()

  return input
    ? logGroups.filter((item) => item.name.toLocaleLowerCase().includes(filter))
    : logGroups
}

const prompts = {
  selectProfileAndRegion: (cachedProfile, cachedRegion) =>
    inquirer.prompt([
      {
        message: 'AWS profile name',
        type: 'input',
        name: 'profile',
        default: cachedProfile || 'default'
      },
      {
        message: 'AWS region',
        type: 'autocomplete',
        name: 'region',
        default: cachedRegion || 'us-east-1',
        source: handlerRegions
      }
    ]),
  selectLogGroup: (logGroups) =>
    inquirer.prompt([
      {
        message: 'AWS log group name',
        type: 'autocomplete',
        name: 'logGroupName',
        source: (_, input) => handlerLogGroups(logGroups, _, input)
      }
    ]),
  selectCacheKey: () => inquirer.prompt([
    {
      message: 'Define alias to save this tail (blank to ignore)',
      type: 'input',
      name: 'savedCacheKey'
    }
  ])
}

const configureCommander = () => {
  commander
    .option('-r, --rerun', 're run', false)
    .option('-a, --alias <alias saved>', 're run with saved alias')
    .option('-l --listAlias', 'list all alias saved')
    .option('-e --export', 'aliases export to file')
    .option('-i --import <file name>', 'aliases import from file')
    .version(pkg.version, '-v, --version')
    .parse(process.argv)

  return { commander, opts: commander.opts() }
}

const checkVersion = async () => {
  const currentLocalVersion = pkg.version
  const currentRemoteVersion = (await execAsync(`npm view ${pkg.name} version`)).stdout.replace(/\r?\n|\r/g, '')

  if (currentLocalVersion !== currentRemoteVersion) {
    hint(`Update available: ${currentLocalVersion} => ${currentRemoteVersion}`)
    hint(`Run npm i -g ${pkg.name} to update\r\n`)
  }
}

const getLoader = (text, color = 'yellow') => {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  return loader({ text, color, frames })
}

module.exports = {
  prompts,
  checkVersion,
  configureCommander,
  execAsync,
  adaptAWSRegions,
  handlerRegions,
  handlerLogGroups,
  getLoader
}
