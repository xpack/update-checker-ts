# Change log

Changes in reverse chronological order.

Refer to GitHub [issues](https://github.com/xpack/update-checker-js/issues).

## 2023-03-18

* 08ba4d3 READMEs updates
* 02010ff workflows renames
* 7e57d17 package-lock.json update
* 2d46f88 package.json cosmetics
* 8ecad1a import cosmetics
* f353b6f update licenses
* b5ed29d eslint max-len

## 2023-03-09

* 97502f8 010-constructor.ts: remove *ConstructorParameters
* 4796da9 update-checker.ts: move constructor type in place
* 42d8f2c update-checker.ts: update typedoc
* c367650 README update
* 4dceb9c typedoc.json: cosmetics
* a6171ae README update
* 84a6855 020-checker.ts: update for new variable name
* 89aa78e #1: make the environment variable configurable
* 61f45bd #22: default variable includes the package name

## 2023-03-07

* ac004c3 .github/workflows update actions
* b6ca962 bump node 16
* d3a0c92 update-checker.ts: re-place c8 ignore start

## 2023-03-05

* 90dbd85 update-checker.ts: rework istanbul ignore
* 3773b33 update-checker.ts: rework c8 ignore start
* 8848fd9 typedoc.yml: use node 14
* 37e3ce4 update-checker.ts: rework c8 ignore start
* 785a73d READMEs updates
* 7590f2b CHANGELOG update
* 8b235d9 .github/workflows update
* a59d6a5 .vscode/settings.json
* 8f27aff README update
* da27147 READMEs updates
* d12f2d0 .vscode/settings.json
* a45bd2a update-checker.ts: cosmetics
* ff9412d typedoc.json: add sort
* 8296491 add more typedoc metadata
* b4e0248 tests: use PublicUpdateChecker
* 1f01dcc update-checker.ts: add /* c8 ignore * */
* 0221e9d update-checker.ts: naming cosmetics
* 3666c9b update-checker.ts: more protected
* 1978e65 update-checker.ts: this.* in sendNotifications

## 2023-03-04

* 2c479d9 update-checker.ts: typedoc
* 09c0cd5 typedoc.json: url comment
* b6b174d typedoc.json: intentionallyNotExported
* f817a04 package.json: typedoc Verbose
* 1453d6d update-checker.ts: fix NO_NPM_UPDATE_NOTIFIER test
* bc312ae update-checker.ts: fix dirname
* b524a21 mock-console.ts: remove stderrStream
* f85c92d READMEs updates
* 37fc669 add & use separate UpdateCheckerTestEnvironment
* 1c20bf0 package-lock.json: update
* 59de4bf package.json: add eslintConfig
* 668b8fe remove eslint comments from sources
* 267df9d configure esm only builds
* 1be8aab typedoc: add custom css

## 2023-03-03

* f28d899 package-lock.json update
* 146f9e0 mock-logger.ts: remove constructor
* f6c05f5 READMEs updates
* 6c4ef6f add typedoc.json
* b6add7f .vscode/settings.json: ignoreWords
* c09b383 update for .ts

## 2023-03-02

* 2382daa rename .ts, move to src, tests, shorten copyright
* c65bd04 update-checker.js: reorder require()
* 42f3968 tests/020-checker.js: fix standard issues
* ddc65a3 package.json: bump deps

## 2021-07-20

* publish v1.2.0
* [#16] - process errors while retrieving latest version
* [#15] - deprecate reference to package user-home
* [#14] - update to package make-dir
* [#13] - use fs promises

## 2020-12-11

* publish v1.1.2
* bump dependencies

## 2019-11-25

* publish v1.1.1
* tweak message, update silently ignored
* switch to GitHub Actions
* enforce 100% coverage

## 2019-11-11

* publish v1.1.0
* [#2] Test environment as a map not an array
* fix standard issues (hasOwnProperty)
* bump deps

## 2019-01-25

* publish v1.0.0
* initial version, extracted from @ilg/cli-start-options-js.
* reworked for testability
* tests added, 100% coverage
