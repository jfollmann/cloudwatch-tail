# CloudWatchTail (CWT)
CLI Utility for Watching AWS CloudWatch Logs

## Table of Contents
- [Install](#🚀-install)
- [CLI in action](#🎯-cli-in-action)
- [Usage](#🎯-usage)
- [Repeat the last tail](#🔁-repeat-the-last-tail)
- [Features](#😍-features)
- [Help](#💁-help)

## 🚀 Install
```bash
npm i -g cloudwatch-tail
```

<br />

## 🎯 CLI in action
  
![cli](https://github.com/jfollmann/cloudwatch-tail/blob/main/docs/cwt-in-action.gif?raw=true)

<br />

## 🎉 Usage
```bash
cwt
```

<br />

## 🔁 Repeat the last tail
**cwt** provides many options to make it easier to rerun the last log tail, either through having it selected as default option the next time you run the ntl command, or by using one of the following:
- **Convenient way**: `cw` command shorhand 🥰
- Using a `--rerun` or `-r`, e.g: `cwt -r`
- Prepending the CWT_RERUN env variable, e.g: `CWT_RERUN=true cwt`

<br />

## 😍 Features
- Interactive interface to filter your log groups
- Support AWS profiles
- Select any log group to start watching
- Filter log group list (autocomplete fuzzy search)
- Easy to repeat last tail (`cwt` and `cw` options)

<br />

## 💁 Help
```
cwt --h 

⬢  CloudWatchTail (CWT)
Usage: cwt [options]

Options:
  -r, --rerun    Re run (default: false)
  -v, --version  output the version number
  -h, --help     display help for command
```

© 2022 [Jefferson Follmann](https://jfollmann.com)