[![GitHub package.json version](https://img.shields.io/github/package-json/v/xpack/update-checker-ts)](https://github.com/xpack/update-checker-ts/blob/mater/package.json)
[![npm (scoped)](https://img.shields.io/npm/v/@xpack/update-checker.svg)](https://www.npmjs.com/package/@xpack/update-checker)
[![license](https://img.shields.io/github/license/xpack/update-checker-js.svg)](https://github.com/xpack/update-checker-js/blob/xpack/LICENSE)

# A Node.js ES6 module to notify when a newer version of a npm package is available

This project provides a **TypeScript** Node.js **ES6** module with
a class to check if a more recent version of a npm package is available.

The open source project is hosted on GitHub as
[xpack/update-checker-ts](https://github.com/xpack/update-checker-ts/).

## Maintainer & developer info

This page documents how to use this module in an user application.
For maintainer information, see the separate
[README-MAINTAINER](https://github.com/xpack/update-checker-ts/blob/master/README-MAINTAINER.md)
page.

## Prerequisites

A recent [Node.js](https://nodejs.org) (>=16.0.0), since the TypeScript code
is compiled into ECMAScript 2020 code with ES6 modules.

## Install

The module is available as
[`@xpack/update-checker`](https://www.npmjs.com/package/@xpack/update-checker/)
from the public [`npmjs`](https://www.npmjs.com) repository;
it can be added as a dependency to any TypeScript or JavaScript
project with `npm install`:

```console
npm install --save @xpack/update-checker@latest
```

The module does not provide any executables, and generally there are no
reasons to install it globally.

## User info

This section is intended for those who plan to use this module in their
own projects.

The `@xpack/update-checker` module can be imported in both TypeScript
and JavaScript ES6 Node.js code with:

```typescript
import { Logger } from '@xpack/update-checker'
```

Note: as per the ES6 specs, importing ES6 modules in legacy
CommonJS modules is no longer possible.

The module can be included in any application and the class can be used
directly or as a base class for a derived class to implement a custom
behaviour (like a custom notifier).

A typical use case is as part of a CLI application.

Example:

```javascript
import { UpdateChecker } from '@xpack/update-checker'
import { Logger } from '@xpack/logger'

async main(argv) {
  const log = new Logger({ level: 'info' })

  // ... Other initializations.

  // Read in the current package JSON (bring your own function here).
  const packageJson = await readPackageJson()

  // Create on instance of notifier class, configured for the current package.
  const updateChecker = new UpdateChecker({
    log: log,
    packageName: packageJson.name,
    packageVersion: packageJson.version
  })

  // Start the update checker, as an asynchronous function running in parallel.
  await updateChecker.initiateVersionRetrieval()

  // ... Perform the application actual work.

  // Before returning, possibly send a notification to the console.
  await updateChecker.notifyIfUpdateIsAvailable()

  return exitCode
}
```

The check is no longer performed during the next 24 hours; this duration
can be configured via the `checkUpdatesIntervalSeconds` constructor property.

The check is skipped if one of the following conditions are met:

- running in a CI environment
- stdout is not a TTY
- the process is running as root
- the program is installed in system locations
- the `NO_<packageName>_UPDATE_NOTIFIER` variable is present in the
  environment map (configurable)

### Reference

For more details on the available class definitions, including all methods,
accessors, properties, etc,
please see the TypeDoc
[reference pages](https://xpack.github.io/update-checker-ts/).

## Known problems

- none

## Status

The `@xpack/update-checker` module is fully functional and stable.

The main client for this module is the `xpm` CLI application.

## Tests

The module is tested
with 100% coverage and CI tested on every push via GitHub
[Actions](https://github.com/xpack/update-checker-ts/actions/).

## Change log - incompatible changes

According to [semver](https://semver.org) rules:

> Major version X (X.y.z | X > 0) MUST be incremented if any
backwards incompatible changes are introduced to the public API.

### v2.0.0

The project was migrated to TypeScript and the code is compiled into
**ES6** modules, that can be consumed by both TypeScript and JavaScript
packages.

Other changes:

- the test environment was moved outside the constructor
- the parameter of `sendNotification()` was removed in favour of the
  instance property

## License

The original content is released under the
[MIT License](https://opensource.org/licenses/MIT/),
with all rights reserved to
[Liviu Ionescu](https://github.com/ilg-ul/).
