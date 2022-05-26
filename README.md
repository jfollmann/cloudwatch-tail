# CloudWatchTail (CWT)
CLI Utility for Watching AWS CloudWatch Logs

![Github](https://img.shields.io/badge/jfollmann-cloudwatch--tail-orange)
![GitHub](https://img.shields.io/github/license/jfollmann/cloudwatch-tail)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/jfollmann/cloudwatch-tail/main)
![node-current](https://img.shields.io/node/v/cloudwatch-tail)
[![CI](https://github.com/jfollmann/cloudwatch-tail/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/jfollmann/cloudwatch-tail/actions/workflows/CI.yml)
[![Coverage Status](https://coveralls.io/repos/github/jfollmann/cloudwatch-tail/badge.svg?branch=main)](https://coveralls.io/github/jfollmann/cloudwatch-tail?branch=main)

## Table of Contents
- [Install](#computer-install)
- [CLI in action](#rocket-cli-in-action)
- [Usage](#red_circle-usage)
- [Repeat the last tail](#repeat-repeat-the-last-tail)
- [Features](#heart_eyes-features)
- [Help](#raising_hand-help)
- [Contributors](#tada-contributors)

## :computer: Install
```bash
npm i -g cloudwatch-tail
```

<br />

## :rocket: CLI in action
  
![cli](https://github.com/jfollmann/cloudwatch-tail/blob/main/docs/cwt-in-action.gif?raw=true)

<br />

## :red_circle: Usage
```bash
cwt
```

<br />

## :repeat: Repeat the last tail
**cwt** provides many options to make it easier to rerun the last log tail, either through having it selected as default option the next time you run the ntl command, or by using one of the following:
- **Convenient way**: `cw` command shorhand 🥰
- Using a `--rerun` or `-r`, e.g: `cwt -r`
- Prepending the CWT_RERUN env variable, e.g: `CWT_RERUN=true cwt`

<br />

## :heart_eyes: Features
- Interactive interface to filter your log groups
- Support AWS profiles
- Select any log group to start watching
- Filter log group list (autocomplete fuzzy search)
- Easy to repeat last tail (`cwt` and `cw` options)

<br />

## :raising_hand: Help
```
cwt --h 

⬢  CloudWatchTail (CWT)
Usage: cwt [options]

Options:
  -r, --rerun    Re run (default: false)
  -v, --version  output the version number
  -h, --help     display help for command
```

<br />

## :tada: Contributors
<a href="https://github.com/jfollmann/cloudwatch-tail/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jfollmann/cloudwatch-tail" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

© 2022 [Jefferson Follmann](https://jfollmann.com)