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
$ npm install @xpack/update-checker --save
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

The check is not done if:

- running in a CI environment
- stdout is not a TTY
- the process is running as root
- the program is installed in system locations
- the `NO_NPM_UPDATE_NOTIFIER` variable is present in the environment

These checks are performed by specialised modules, but it is possible
to override them by passing boolean properties to the constructor:

- `isCI`
- `isTTY`
- `isRunningAsRoot`
- `isInstalledGlobally`
- `isInstalledAsRoot`

The valability of the check can also be configured via a property:

- `checkUpdatesIntervalSeconds`
  
## Maintainer & Developer info

### Git repo

```console
$ git clone https://github.com/xpack/update-checker-js.git update-checker-js.git
$ cd update-checker-js.git
$ npm install
$ sudo npm link 
$ ls -l /usr/local/lib/node_modules/@xpack
```

A link to the development folder should be present in the system
`node_modules` folder.

In projects that use this module under development, link back from the
global location:

```console
$ npm link @xpack/update-checker
```

### Tests

The tests use the [`node-tap`](http://www.node-tap.org) framework 
(_A Test-Anything-Protocol library for Node.js_, written by Isaac Schlueter).

As for any `npm` package, the standard way to run the project tests is via 
`npm test`:

```console
$ cd update-checker-js.git
$ npm install
$ npm run test
```

A typical test result looks like:

```console
$ npm run test

> @xpack/update-checker@1.0.0 test /Users/ilg/My Files/MacBookPro Projects/xPack/npm-modules/update-checker-js.git
> standard && npm run test-tap -s

test/tap/010-constructor.js ......................... 14/14
test/tap/020-checker.js ............................. 36/36
total ............................................... 50/50

  50 passing (2s)

  ok
```

To run a specific test with more verbose output, use `npm run tap`:

```console
$ npm run tap test/tap/020-checker.js

> @xpack/update-checker@1.0.0 tap /Users/ilg/My Files/MacBookPro Projects/xPack/npm-modules/update-checker-js.git
> tap --reporter=spec --timeout 300 --no-color "test/tap/020-checker.js"

test/tap/020-checker.js
  asserts
    ✓ UpdateChecker is defined
    ✓ MockLog is defined

  outdated version
    ✓ has no timestamp
    ✓ promise created
    ✓ newer version detected
    ✓ recommended command ok
    ✓ has timestamp
    ✓ promise not created immediately

  retried immediately
    ✓ has timestamp
    ✓ promise not created
    ✓ not notified

  retried after age
    ✓ has timestamp
    ✓ promise created
    ✓ newer version detected
    ✓ recommended command ok
    ✓ has timestamp

  same version
    ✓ promise created
    ✓ not notified

  outdated version sudo
    ✓ promise created
    ✓ newer version detected
    ✓ recommended command ok

  outdated version global
    ✓ promise created
    ✓ newer version detected
    ✓ recommended command ok

  outdated version as root
    ✓ promise created
    ✓ newer version detected
    ✓ recommended command ok
    ✓ has no timestamp

  outdated version NO_NPM_UPDATE_NOTIFIER
    ✓ promise not created
    ✓ has no timestamp

  outdated version !isTTY
    ✓ promise not created
    ✓ has no timestamp

  outdated version isCI
    ✓ promise not created
    ✓ has no timestamp

  outdated version untuned
    ✓ promise not created
    ✓ has no timestamp


  36 passing (1s)
```

### Coverage tests

Coverage tests are a good indication on how much of the source files is 
exercised by the tests. Ideally all source files should be covered 100%, 
for all 4 criteria (statements, branches, functions, lines).

To run the coverage tests, use `npm run test-coverage`:

```console
$ npm run test-coverage

> @xpack/update-checker@1.0.0 test-coverage /Users/ilg/My Files/MacBookPro Projects/xPack/npm-modules/update-checker-js.git
> tap --coverage --reporter=classic --timeout 600 --no-color "test/tap/*.js"

test/tap/010-constructor.js ......................... 14/14
test/tap/020-checker.js ............................. 36/36
total ............................................... 50/50

  50 passing (2s)

  ok
---------------------------|----------|----------|----------|----------|-------------------|
File                       |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
---------------------------|----------|----------|----------|----------|-------------------|
All files                  |      100 |      100 |      100 |      100 |                   |
 update-checker-js.git     |      100 |      100 |      100 |      100 |                   |
  index.js                 |      100 |      100 |      100 |      100 |                   |
 update-checker-js.git/lib |      100 |      100 |      100 |      100 |                   |
  update-checker.js        |      100 |      100 |      100 |      100 |                   |
---------------------------|----------|----------|----------|----------|-------------------|
```

It is also possible to get coverage while running a single test:

```console
$ npm run tap-coverage test/tap/020-checker.js

> @xpack/update-checker@1.0.0 tap-coverage /Users/ilg/My Files/MacBookPro Projects/xPack/npm-modules/update-checker-js.git
> tap --coverage --reporter=spec --timeout 300 --no-color "test/tap/020-checker.js"
...
```

#### Coverage exceptions

Exclusions are marked with the `/* istanbul ignore next */` (https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md).

- in the constructor, the test if the module is installed on win32 is ignored,
  since most tests are not done on win32.

### Continuous Integration (CI)

The continuous integration tests are performed via 
[Travis CI](https://travis-ci.org/xpack/update-checker-js) and 
[AppVeyor](https://ci.appveyor.com/project/ilg-ul/update-checker-js).

To speed up things, the `node_modules` folder is cached between builds.

### Standard compliance

The module uses ECMAScript 6 class definitions.

As style, it uses the [JavaScript Standard Style](https://standardjs.com/), 
automatically checked at each commit via Travis CI.

Known and accepted exceptions:

- `// eslint-disable-line node/no-deprecated-api` to continue using the 
deprecated `domain` module

To manually fix compliance with the style guide (where possible):

```console
$ npm run fix

> @xpack/update-checker@1.0.0 fix /Users/ilg/My Files/MacBookPro Projects/xPack/npm-modules/update-checker-js.git
> standard --fix

```

### Documentation metadata

The documentation metadata follows the [JSdoc](http://usejsdoc.org) tags.

To enforce checking at file level, add the following comments right after 
the `use strict`:

```javascript
'use strict'
/* eslint valid-jsdoc: "error" */
/* eslint max-len: [ "error", 80, { "ignoreUrls": true } ] */
```

Note: be sure C style comments are used, C++ styles are not parsed by 
[ESLint](http://eslint.org).

### How to publish

* `npm run fix`
* commit all changes
* `npm run test-coverage`
* update `CHANGELOG.md`; commit with a message like _CHANGELOG: prepare v1.2.3_
* `npm version patch` (bug fixes), `npm version minor` (compatible API 
  additions), `npm version major` (incompatible API changes)
* push all changes to GitHub; this should trigger CI
* wait for CI tests to complete
* `npm publish` (use `--access public` when publishing for the first time)

## License

The original content is released under the 
[MIT License](https://opensource.org/licenses/MIT), with all rights 
reserved to [Liviu Ionescu](https://github.com/ilg-ul).
