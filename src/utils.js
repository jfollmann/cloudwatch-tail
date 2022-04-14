const { warn } = require('simple-output')
const { promisify } = require('util')
const { exec } = require('child_process')
const { list: listAwsRegions } = require('aws-regions')
const commander = require('commander')
const inquirer = require('inquirer')
const pkg = require('../package.json')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

const execAsync = promisify(exec)

const prompts = {
  first: (profile, region) =>
    inquirer.prompt([
      {
        message: 'AWS profile name',
        type: 'input',
        name: 'profile',
        default: profile || 'default'
      },
      {
        message: 'AWS region',
        type: 'autocomplete',
        name: 'region',
        default: region || 'us-east-1',
        source: (_, input) => {
          const regions = listAwsRegions().map(({ name, code }) => ({ name: `${name} (${code})`, value: code }))

          return input
            ? regions.filter((item) => item.name.toLocaleLowerCase().includes(input) || item.value.toLocaleLowerCase().includes(input))
            : regions
        }
      }
    ]),
  second: (logGroups) =>
    inquirer.prompt([
      {
        message: 'AWS log group name',
        type: 'autocomplete',
        name: 'logGroupName',
        source: (_, input) => {
          return input
            ? logGroups.filter((item) => item.name.toLocaleLowerCase().includes(input))
            : logGroups
        }
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
  execAsync
}
