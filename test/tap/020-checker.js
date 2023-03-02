/*
 * This file is part of the xPack distribution
 *   (http://xpack.github.io).
 * Copyright (c) 2019 Liviu Ionescu.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict'
/* eslint valid-jsdoc: "error" */
/* eslint max-len: [ "error", 80, { "ignoreUrls": true } ] */

// ----------------------------------------------------------------------------

/**
 * Test the data model for storing and processing commands.
 */

// ----------------------------------------------------------------------------

// The `[node-tap](http://www.node-tap.org)` framework.
const test = require('tap').test

const MockLog = require('../common.js').MockLog

const UpdateChecker = require('../../index.js').UpdateChecker

const timestampsFolderAbsolutePath = undefined

const packageName = 'xpm'
const packageVersion = '0.0.1'
let latestVersion

// ----------------------------------------------------------------------------

function sleep (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

// ----------------------------------------------------------------------------

test('asserts', (t) => {
  t.ok(UpdateChecker !== undefined, 'UpdateChecker is defined')
  t.ok(MockLog !== undefined, 'MockLog is defined')

  t.end()
})

test('outdated version', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await uc.clearTimestamp()
  let stat = await uc.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  await uc.initiateVersionRetrieval()
  t.ok(uc.latestVersionPromise !== undefined, 'promise created')
  await uc.notifyIfUpdateIsAvailable()

  // Save actual version for later use.
  latestVersion = uc.latestVersion

  const str = mockLog.lines.join('\n')

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'npm install ${packageName}' to update. <<<`,
    'recommended command ok')

  stat = await uc.readTimestamp()
  t.ok(stat !== null, 'has timestamp')

  mockLog.clear()

  // Rerun immediately, it should not create the promise.
  await uc.initiateVersionRetrieval()
  t.equal(uc.latestVersionPromise, undefined,
    'promise not created immediately')

  t.end()
})

test('retried immediately', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  const stat = await uc.readTimestamp()
  t.ok(stat !== null, 'has timestamp')

  // Rerun immediately, it should not create the promise.
  await uc.initiateVersionRetrieval()
  t.equal(uc.latestVersionPromise, undefined, 'promise not created')

  // This should have no effect.
  await uc.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')
  t.notMatch(str, '>>> New version', 'not notified')

  t.end()
})

test('retried after age', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  // Force the minimal delay, the public API uses seconds.
  uc.checkUpdatesIntervalMilliseconds = 1
  await sleep(10)

  let stat = await uc.readTimestamp()
  t.ok(stat !== null, 'has timestamp')

  await uc.initiateVersionRetrieval()
  t.ok(uc.latestVersionPromise !== undefined, 'promise created')

  await uc.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'npm install ${packageName}' to update. <<<`,
    'recommended command ok')

  stat = await uc.readTimestamp()
  t.ok(stat !== null, 'has timestamp')

  t.end()
})

test('same version', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion: latestVersion,
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.ok(uc.latestVersionPromise !== undefined, 'promise created')
  await uc.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')
  t.notMatch(str, '>>> New version', 'not notified')

  t.end()
})

test('outdated version sudo', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: true, // <-
    isInstalledGlobally: false
  })

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.ok(uc.latestVersionPromise !== undefined, 'promise created')
  await uc.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'sudo npm install ${packageName}' to update. <<<`,
    'recommended command ok')

  t.end()
})

test('outdated version global', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: true // <-
  })

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.ok(uc.latestVersionPromise !== undefined, 'promise created')
  await uc.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'npm install --global ${packageName}' to update. <<<`,
    'recommended command ok')

  t.end()
})

test('outdated version as root', async (t) => {
  const saved = process.env
  delete process.env

  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    // env: {},
    isRunningAsRoot: true, // <-
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })
  process.env = saved

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.ok(uc.latestVersionPromise !== undefined, 'promise created')
  await uc.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'npm install ${packageName}' to update. <<<`,
    'recommended command ok')

  const stat = await uc.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

test('outdated version NO_NPM_UPDATE_NOTIFIER', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    env: { NO_NPM_UPDATE_NOTIFIER: '' }, // <-
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.equal(uc.latestVersionPromise, undefined, 'promise not created')

  const stat = await uc.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

test('outdated version !isTTY', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: false, // <-
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.equal(uc.latestVersionPromise, undefined, 'promise not created')

  const stat = await uc.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

test('outdated version isCI', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath,
    isCI: true, // <-
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.equal(uc.latestVersionPromise, undefined, 'promise not created')

  const stat = await uc.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

test('outdated version untuned', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    timestampsFolderAbsolutePath
  })

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.equal(uc.latestVersionPromise, undefined, 'promise not created')

  const stat = await uc.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

test('missing package', async (t) => {
  const mockLog = new MockLog()
  const uc = new UpdateChecker({
    log: mockLog,
    packageName: '@xpack/no-such-package',
    packageVersion: '0.0.0',
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.ok(uc.latestVersionPromise !== undefined, 'promise created')

  await uc.notifyIfUpdateIsAvailable()
  t.ok(uc.returnedError !== undefined, 'has error')
  // console.log(uc.returnedError)

  t.end()
})

test('missing package debug', async (t) => {
  const mockLog = new MockLog()
  mockLog.isDebug = true
  const uc = new UpdateChecker({
    log: mockLog,
    packageName: '@xpack/no-such-package',
    packageVersion: '0.0.0',
    timestampsFolderAbsolutePath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await uc.clearTimestamp()
  await uc.initiateVersionRetrieval()
  t.ok(uc.latestVersionPromise !== undefined, 'promise created')

  await uc.notifyIfUpdateIsAvailable()
  t.ok(uc.returnedError !== undefined, 'has error')
  // console.log(uc.returnedError.message)

  t.end()
})

// ----------------------------------------------------------------------------
