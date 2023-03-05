[![GitHub package.json version](https://img.shields.io/github/package-json/v/xpack/update-checker-ts)](https://github.com/xpack/update-checker-ts/blob/mater/package.json)
[![npm (scoped)](https://img.shields.io/npm/v/@xpack/update-checker.svg)](https://www.npmjs.com/package/@xpack/update-checker/)
[![license](https://img.shields.io/github/license/xpack/update-checker-ts.svg)](https://github.com/xpack/update-checker-ts/blob/xpack/LICENSE)
[![TS-Standard - Typescript Standard Style Guide](https://badgen.net/badge/code%20style/ts-standard/blue?icon=typescript)](https://github.com/standard/ts-standard/)
[![Actions Status](https://github.com/xpack/update-checker-ts/workflows/CI%20on%20Push/badge.svg)](https://github.com/xpack/update-checker-ts/actions/)
[![GitHub issues](https://img.shields.io/github/issues/xpack/update-checker-ts.svg)](https://github.com/xpack/update-checker-ts/issues/)
[![GitHub pulls](https://img.shields.io/github/issues-pr/xpack/update-checker-ts.svg)](https://github.com/xpack/update-checker-ts/pulls/)

# Maintainer & developer info

## Project repository

The project is hosted on GitHub:

- <https://github.com/xpack/update-checker-ts.git>

The project uses two branches:

- `master`, with the latest stable version (default)
- `develop`, with the current development version

To clone the `master` branch, use:

```sh
mkdir ${HOME}/Work/vscode-extensions && cd ${HOME}/Work/vscode-extensions
git clone \
https://github.com/xpack/update-checker-ts.git update-checker-ts.git
```

For development, to clone the `develop` branch, use:

```sh
git clone --branch develop \
https://github.com/xpack/update-checker-ts.git update-checker-ts.git
```

## Prerequisites

The prerequisites are:

- node >= 14.13
- npm

To ensure compatibility with older node, revert to an older one:

```sh
nvm use --lts 14
code
```

For the TypeScript configuration, please see:

- [@tsconfig/node14](https://www.npmjs.com/package/@tsconfig/node14)

## Satisfy dependencies

```sh
npm install
```

## Add links for development

```sh
cd update-checker-ts.git
npm link
```

And in the projects referring it:

```sh
npm link @xpack/update-checker
```

## Start the compile background task

The TypeScript compiler can automatically recompile modified files. For
this, start it in `watch` mode.

```sh
npm run compile-watch
```

## Language standard compliance

The current version is TypeScript 4:

- <https://www.typescriptlang.org>
- <https://www.typescriptlang.org/docs/handbook>

Configured the compiler to produce `node16` files, which means
ECMAScript6 with modules, that can be imported by any other project
which uses ES6.

For more details on how to configure `tsconfig.json`, please see:

- <https://www.typescriptlang.org/tsconfig/>

## Standard style

As style, the project uses `ts-standard`, the TypeScript variant of
[Standard Style](https://standardjs.com/#typescript),
automatically checked at each commit via CI.

If necessary the syntax for exceptions is:

```js
// eslint-disable-next-line @typescript-eslint/no-xxx-yyy
```

The known rules are documented in the
[typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin/docs/rules)
project.

Generally, to fit two editor windows side by side in a screen,
all files should limit the line length to 80.

```json
  "eslintConfig": {
    "rules": {
      "max-len": [
        "error",
        80,
        {
          "ignoreUrls": true
        }
      ]
    }
  },
```

The same can be specified in each file:

```js
/* eslint max-len: [ "error", 80, { "ignoreUrls": true } ] */
```

Known and accepted exceptions:

- none

To manually fix compliance with the style guide (where possible):

```console
% npm run fix

> @xpack/update-checker@2.0.0 fix
> ts-standard --fix src tests
...
```

## Documentation metadata

The documentation metadata uses the
[TypeDoc](https://typedoc.org/guides/doccomments/) tags, without
explicit types, since they are provided by TypeScript.

## Tests

The tests use the [`node-tap`](http://www.node-tap.org) framework
(_A Test-Anything-Protocol library for Node.js_, written by Isaac Schlueter).

Tests can be written in TypeScript, assuming `ts-node` is also installed
(<https://node-tap.org/docs/using-with/#using-tap-with-typescript>)

As for any `npm` package, the standard way to run the project tests is via
`npm run test`:

```sh
cd update-checker-ts.git
npm install
npm run test
```

A full test run, including coverage, looks like:

```console
% npm run test-100-c8

> @xpack/update-checker@2.0.0 pretest-100-c8 /Users/ilg/My Files/WKS Projects/xpack.github/npm-modules/update-checker-ts.git
> npm run lint

> @xpack/update-checker@2.0.0 lint /Users/ilg/My Files/WKS Projects/xpack.github/npm-modules/update-checker-ts.git
> ts-standard src

> @xpack/update-checker@2.0.0 test-100-c8 /Users/ilg/My Files/WKS Projects/xpack.github/npm-modules/update-checker-ts.git
> npm run test-tap-coverage-100-c8 -s

(node:9919) ExperimentalWarning: --experimental-loader is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
(node:9920) ExperimentalWarning: --experimental-loader is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
tests/tap/010-constructor.ts ........................ 15/15
tests/tap/020-checker.ts ............................ 43/43
total ............................................... 58/58

  58 passing (6s)

  ok
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |     100 |      100 |     100 |     100 |
 src                |     100 |      100 |     100 |     100 |
  index.ts          |     100 |      100 |     100 |     100 |
 src/lib            |     100 |      100 |     100 |     100 |
  update-checker.ts |     100 |      100 |     100 |     100 |
--------------------|---------|----------|---------|---------|-------------------
```

To run a specific test with more verbose output, use `npm run tap`:

```console
% npm run tap tests/tap/010-constructor.ts

> @xpack/update-checker@2.0.0 tap /Users/ilg/My Files/WKS Projects/xpack.github/npm-modules/update-checker-ts.git
> tap --reporter=spec "tests/tap/010-constructor.ts"

(node:10352) ExperimentalWarning: --experimental-loader is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
tests/tap/010-constructor.ts
  asserts
    ✓ UpdateChecker is defined
    ✓ MockConsole is defined
    ✓ MockLogger is defined

  constructor with values
    ✓ created
    ✓ logged
    ✓ name ok
    ✓ version ok
    ✓ folder path ok
    ✓ file path ok
    ✓ file suffix ok
    ✓ interval ok

  constructor without values
    ✓ assert(params) throws
    ✓ assert(params.log) throws
    ✓ assert(params.packageName) throws
    ✓ assert(params.packageVersion) throws

  15 passing (1s)
```

### Coverage tests

Coverage tests are a good indication on how much of the source files is
exercised by the tests. Ideally all source files should be covered 100%,
for all 4 criteria (statements, branches, functions, lines).

Thus, passing coverage tests was enforced for all tests, as seen before.

#### Coverage exceptions

Exclusions are marked with `/* istanbul ignore next */` for
[istanbul](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md)
and `/* c8 ignore start */` `/* c8 ignore stop */` for
[c8](https://github.com/bcoe/c8).

- in the constructor
  - the tests if running on Windows are skipped, to allow tests to run on
  Linux/macOS
  - the possible exception when creating the timestamp is not checked

### Continuous Integration (CI)

The continuous integration tests are performed via GitHub
[Actions](https://github.com/xpack/update-checker-ts/actions/) on Ubuntu,
Windows and macOS, using node 14, 16, 18.

## How to make new releases

### Release schedule

There are no fixed releases.

### Check Git

In the `xpack/update-checker-ts` Git repo:

- switch to the `develop` branch
- if needed, merge the `master` branch

No need to add a tag here, it'll be added when the release is created.

### Update npm packages

- `npm outdated`
- `npm update` or edit and `npm install`
- repeat and possibly manually edit `package.json` until everything is
  up to date
- commit the changes

Keep:

- [`@types/node`](https://www.npmjs.com/package/@types/node?activeTab=versions)
  locked to the oldest supported node (^14.18.36)
  [release](https://nodejs.org/download/release/) available for Typescript.

### Determine the next version

As required by npm modules, this one also uses [semver](https://semver.org).

Determine the next version (like `2.0.0`),
and eventually update the
`package.json` file; the format is `2.0.0-pre`.

### Fix possible open issues

Check GitHub issues and pull requests:

- <https://github.com/xpack/update-checker-ts/issues/>

### Update `README-MAINTAINER.md`

Update the `README-MAINTAINER.md` file to reflect the changes
related to the new version.

## Update `CHANGELOG.md`

- check the latest commits `npm run git-log`
- open the `CHANGELOG.md` file
- check if all previous fixed issues are in
- add a line _* v2.0.0 released_
- commit with a message like _prepare v2.0.0_

## Prepare to publish

- terminate all running tasks (**Terminal** → **Terminate Task...**)
- select the `develop` branch
- commit everything
- `npm run fix`
- in the develop branch, commit all changes
- `npm run test`
- `npm run typedoc` and open the `docs/index.html` in a browser
- `npm run pack`; check the list of packaged files, possibly
  update `.npmignore`
- `npm version patch` (bug fixes), `npm version minor` (compatible API
  additions), `npm version major` (incompatible API changes)
- push all changes to GitHub;
- the `postversion` npm script should also update tags via
  `git push origin --tags`; this should trigger CI
- **wait for CI tests to complete**
- check <https://github.com/xpack/update-checker-ts/actions/>

## Publish to npmjs.com

- `npm publish --tag next` (use `--access public` when publishing for the first time)

Check if the version is present at
[@xpack/update-checker Versions](https://www.npmjs.com/package/@xpack/update-checker?activeTab=versions).

### Test

Test it with:

```bash
npm install -global @xpack/update-checker@next
```

### Merge into `master`

In this Git repo:

- select the `master` branch
- merge `develop`
- push all branches

## Web site deployment

The documentation site is built with [TypeDoc](https://typedoc.org/) and
published in the project GitHub
[Pages](https://xpack.github.io/update-checker-ts/).

The Web site deployment is performed automatically when pushing to the
master branch, by a dedicated workflow in GitHub
[Actions](https://github.com/xpack/update-checker-ts/actions/workflows/typedoc.yml).

### Tag the npm package as `latest`

When the release is considered stable, promote it as `latest`:

- `npm dist-tag ls @xpack/update-checker`
- `npm dist-tag add @xpack/update-checker@2.0.0 latest`
- `npm dist-tag ls @xpack/update-checker`

## Useful links

- <https://www.typescriptlang.org/docs/>
- <https://www.typescriptlang.org/tsconfig/>
- <https://typedoc.org>, <https://typedoc.org/guides/doccomments/>
- <https://tsdoc.org>
- <https://jsdoc.app/index.html>
- <https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1>
