[![npm (scoped)](https://img.shields.io/npm/v/@xpack/update-checker.svg)](https://www.npmjs.com/package/@xpack/update-checker)
[![license](https://img.shields.io/github/license/xpack/update-checker-js.svg)](https://github.com/xpack/update-checker-js/blob/xpack/LICENSE)
[![Standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com/)
[![Actions Status](https://github.com/xpack/update-checker-js/workflows/Node.js%20CI%20on%20Push/badge.svg)](https://github.com/xpack/update-checker-js/actions)
[![GitHub issues](https://img.shields.io/github/issues/xpack/update-checker-js.svg)](https://github.com/xpack/update-checker-js/issues)
[![GitHub pulls](https://img.shields.io/github/issues-pr/xpack/update-checker-js.svg)](https://github.com/xpack/update-checker-js/pulls)

## update-checker.js - maintainer info

This page documents some of the operations required during module
development and maintenance.

For the user information, see the
[README](https://github.com/xpack/update-checker-js/blob/master/README.md) file.

### Git repo

```console
$ git clone https://github.com/xpack/update-checker-js.git update-checker-js.git
$ cd update-checker-js.git
$ npm install
$ sudo npm link
$ ls -l ${HOME}/.nvm/versions/node/$(node --version)/lib/node_modules/@xpack
```

A link to the development folder should be present in the
`node_modules` folder.

In projects that use this module under development, link back from the
global location:

```console
$ cd <project-folder>
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

Note: the test related files are not present on the published package,
and to access them it is necessary to use the development repository.

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
[GitHub Actions](https://github.com/features/actions) on Ubuntu,
Windows and macOS, using node 8, 10, 12.

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
> standard --fix --verbose
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

### Known issues

- more recent versions of "is-installed-globally" fail on Windows; as a
workaround, the module is locked to "0.1.0".

### How to publish

- `npm run fix`
- commit all changes
- `npm run test-coverage`
- update `CHANGELOG.md`; commit with a message like _CHANGELOG: prepare v1.2.3_
- `npm version patch` (bug fixes), `npm version minor` (compatible API
  additions), `npm version major` (incompatible API changes)
- push all changes to GitHub; this should trigger CI
- wait for CI tests to complete
- `npm publish` (use `--access public` when publishing for the first time)
