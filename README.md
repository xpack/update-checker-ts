[![npm (scoped)](https://img.shields.io/npm/v/@xpack/update-checker.svg)](https://www.npmjs.com/package/@xpack/update-checker)
[![license](https://img.shields.io/github/license/xpack/update-checker-js.svg)](https://github.com/xpack/update-checker-js/blob/xpack/LICENSE)
[![Standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com/)
[![Travis](https://img.shields.io/travis/xpack/update-checker-js.svg?label=linux)](https://travis-ci.org/xpack/update-checker-js)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/2k4rmdt93po3a6r5?svg=true)](https://ci.appveyor.com/project/ilg-ul/update-checker-js)
[![GitHub issues](https://img.shields.io/github/issues/xpack/update-checker-js.svg)](https://github.com/xpack/update-checker-js/issues)
[![GitHub pulls](https://img.shields.io/github/issues-pr/xpack/update-checker-js.svg)](https://github.com/xpack/update-checker-js/pulls)

## Check if a newer version of a `npm` package is available

A Node.js module with a class to check if a more recent version of
a npm package is available.

## Prerequisites

A recent [Node.js](https://nodejs.org) (>=8.x), since the ECMAScript 6 class
syntax is used.

## Easy install

The module is available as
[`@xpack/update-checker`](https://www.npmjs.com/package/@xpack/update-checker)
from the public repository, use `npm` to install it inside the module where
it is needed:

```console
$ cd <npm-package-project>
$ npm install @xpack/update-checker
```

The module does not provide any executables, and generally there are few
reasons to install it globally.

The development repository is available from the GitHub
[xpack/update-checker-js](https://github.com/xpack/update-checker-js)
project.

## User info

The module can be included in any application and the class can be used
directly or custom class can be derived from it for custom behaviour.

A typical use case is a CLI application.

The logger must have at least the `log.info()`, `log.debug()` and
`log.trace()` methods; a good candidate is a logger derived from
`@xpack/logger`.

Example:

```javascript
const UpdateChecker = require('@xpack/update-checker').UpdateChecker
const Logger = require('@xpack/logger').Logger

async main(argv) {
  const log = new Logger({
    level: 'info'
  })

  // ... Other initializations.

  // Read in the current package JSON (bring your own function here).
  const package = await readPackageJson()

  // Create the notifier object, tuned to the current package.
  updateChecker = new UpdateChecker({
    log: log,
    packageName: package.name,
    packageVersion: package.version
  })

  await updateChecker.initiateVersionRetrieval()

  // ... Perform the application actual work.

  // Before returning, possibly send a notification to the console.
  await updateChecker.notifyIfUpdateIsAvailable()

  return exitCode
}
```

The check is not done if one of the foollowing conditions are met:

- running in a CI environment
- stdout is not a TTY
- the process is running as root
- the program is installed in system locations
- the `NO_NPM_UPDATE_NOTIFIER` variable is present in the environment map

These checks are performed by specialised modules, but it is possible
to override them by passing boolean properties to the constructor:

- `isCI`
- `isTTY`
- `isRunningAsRoot`
- `isInstalledGlobally`
- `isInstalledAsRoot`

The valability of the check can also be configured via a property:

- `checkUpdatesIntervalSeconds`

## Maintainer info

This page documents how to use this module in an user application.
For maintainer information, see the separate
[README-MAINTAINER](https://github.com/xpack/update-checker-js/blob/master/README-MAINTAINER.md)
page.

## License

The original content is released under the
[MIT License](https://opensource.org/licenses/MIT), with all rights
reserved to [Liviu Ionescu](https://github.com/ilg-ul).
