const pkg = require('../package.json')

const { warn } = require('simple-output')
const { promisify } = require('util')
const { exec } = require('child_process')
const { list: listAwsRegions } = require('aws-regions')
const commander = require('commander')
const inquirer = require('inquirer')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

const execAsync = promisify(exec)

const adaptAWSRegions = (itens) => itens.map(({ name, code }) => ({ name: `${name} (${code})`, value: code }))

const handlerRegions = (_, input) => {
  const regions = adaptAWSRegions(listAwsRegions())

  return input
    ? regions.filter(({ name, value }) => name.toLocaleLowerCase().includes(input) || value.toLocaleLowerCase().includes(input))
    : regions
}

const handlerLogGroups = (logGroups, _, input) => {
  return input
    ? logGroups.filter(({ name }) => name.toLocaleLowerCase().includes(input))
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
    ])
}

const configureCommander = () => {
  commander
    .option('-r, --rerun', 'Re run', false)
    .version(pkg.version, '-v, --version')
    .parse(process.argv)

  return { commander, opts: commander.opts() }
}

const checkVersion = async () => {
  const currentLocalVersion = pkg.version
  const currentRemoteVersion = (await execAsync(`npm view ${pkg.name} version`)).stdout.replace(/\r?\n|\r/g, '')

  if (currentLocalVersion !== currentRemoteVersion) {
    warn(`Update available: ${currentLocalVersion} => ${currentRemoteVersion}`)
    warn(`Run npm i -g ${pkg.name} to update\r\n`)
  }
}

module.exports = {
  prompts,
  checkVersion,
  configureCommander,
  execAsync,
  adaptAWSRegions,
  handlerRegions,
  handlerLogGroups
}
