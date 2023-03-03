/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2019 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT/.
 */

/* eslint max-len: [ "error", 80, { "ignoreUrls": true } ] */

// ----------------------------------------------------------------------------

/**
 * Test the data model for storing and processing commands.
 */

// ----------------------------------------------------------------------------

import { strict as assert } from 'node:assert'

// The `[node-tap](http://www.node-tap.org)` framework.
import { test } from 'tap'

// import { Logger } from '@xpack/logger'

// ----------------------------------------------------------------------------

import { MockConsole } from '../mocks/mock-console.js'
import { MockLogger } from '../mocks/mock-logger.js'

import { UpdateChecker } from '../../src/index.js'

// ----------------------------------------------------------------------------

// const timestampsFolderPath: string | undefined = undefined

const packageName = 'xpm'
const packageVersion = '0.0.1'
let latestVersion: string = ''

// ----------------------------------------------------------------------------

async function sleep (millis: number): Promise<void> {
  return await new Promise((resolve, _reject) => {
    setTimeout(resolve, millis)
  })
}

// ----------------------------------------------------------------------------

await test('asserts', (t) => {
  t.ok(UpdateChecker !== undefined, 'UpdateChecker is defined')
  t.ok(MockConsole !== undefined, 'MockConsole is defined')
  t.ok(MockLogger !== undefined, 'MockLogger is defined')

  t.end()
})

await test('outdated version', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await checker.clearTimestamp()
  let stat = await checker.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  await checker.initiateVersionRetrieval()
  t.ok(checker.latestVersionPromise !== undefined, 'promise created')
  await checker.notifyIfUpdateIsAvailable()

  assert(checker.latestVersion !== undefined)
  // Save actual version for later use.
  latestVersion = checker.latestVersion

  const str = mockLog.lines.join('\n')
  // console.log(str)

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'npm install ${packageName}' to update. <<<`,
    'recommended command ok')

  stat = await checker.readTimestamp()
  t.ok(stat !== null, 'has timestamp')

  mockLog.clear()

  // Rerun immediately, it should not create the promise.
  await checker.initiateVersionRetrieval()
  t.equal(checker.latestVersionPromise, undefined,
    'promise not created immediately')

  t.end()
})

await test('retried immediately', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  const stat = await checker.readTimestamp()
  t.ok(stat !== null, 'has timestamp')

  // Rerun immediately, it should not create the promise.
  await checker.initiateVersionRetrieval()
  t.equal(checker.latestVersionPromise, undefined, 'promise not created')

  // This should have no effect.
  await checker.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')
  t.notMatch(str, '>>> New version', 'not notified')

  t.end()
})

await test('retried after age', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  // Force the minimal delay, the public API uses seconds.
  checker.checkUpdatesIntervalMilliseconds = 1
  await sleep(10)

  let stat = await checker.readTimestamp()
  t.ok(stat !== null, 'has timestamp')

  await checker.initiateVersionRetrieval()
  t.ok(checker.latestVersionPromise !== undefined, 'promise created')

  await checker.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'npm install ${packageName}' to update. <<<`,
    'recommended command ok')

  stat = await checker.readTimestamp()
  t.ok(stat !== null, 'has timestamp')

  t.end()
})

await test('same version', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion: latestVersion,
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.ok(checker.latestVersionPromise !== undefined, 'promise created')
  await checker.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')
  t.notMatch(str, '>>> New version', 'not notified')

  t.end()
})

await test('outdated version sudo', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: true, // <-
    isInstalledGlobally: false
  })

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.ok(checker.latestVersionPromise !== undefined, 'promise created')
  await checker.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'sudo npm install ${packageName}' to update. <<<`,
    'recommended command ok')

  t.end()
})

await test('outdated version global', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: true // <-
  })

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.ok(checker.latestVersionPromise !== undefined, 'promise created')
  await checker.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'npm install --global ${packageName}' to update. <<<`,
    'recommended command ok')

  t.end()
})

interface mockProcess {
  env?: any
}

await test('outdated version as root', async (t) => {
  const saved = process.env
  const mockProcess: mockProcess = process
  delete mockProcess.env

  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    // env: {},
    isRunningAsRoot: true, // <-
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })
  process.env = saved

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.ok(checker.latestVersionPromise !== undefined, 'promise created')
  await checker.notifyIfUpdateIsAvailable()

  const str = mockLog.lines.join('\n')

  t.match(str, '>>> New version', 'newer version detected')
  t.match(str, `>>> Run 'npm install ${packageName}' to update. <<<`,
    'recommended command ok')

  const stat = await checker.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

await test('outdated version NO_NPM_UPDATE_NOTIFIER', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    env: { NO_NPM_UPDATE_NOTIFIER: '' }, // <-
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.equal(checker.latestVersionPromise, undefined, 'promise not created')

  const stat = await checker.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

await test('outdated version !isTTY', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    // timestampsFolderPath,
    isCI: false,
    isTTY: false, // <-
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.equal(checker.latestVersionPromise, undefined, 'promise not created')

  const stat = await checker.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

await test('outdated version isCI', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion,
    // timestampsFolderPath,
    isCI: true, // <-
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.equal(checker.latestVersionPromise, undefined, 'promise not created')

  const stat = await checker.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

await test('outdated version untuned', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName,
    packageVersion
    // timestampsFolderPath
  })

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.equal(checker.latestVersionPromise, undefined, 'promise not created')

  const stat = await checker.readTimestamp()
  t.ok(stat === null, 'has no timestamp')

  t.end()
})

await test('missing package', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName: '@xpack/no-such-package',
    packageVersion: '0.0.0',
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.ok(checker.latestVersionPromise !== undefined, 'promise created')

  await checker.notifyIfUpdateIsAvailable()
  t.ok(checker.returnedError !== undefined, 'has error')
  // console.log(uc.returnedError)

  t.end()
})

await test('missing package debug', async (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'info' })

  // mockLog.isDebug = true
  const checker = new UpdateChecker({
    log: mockLog,
    packageName: '@xpack/no-such-package',
    packageVersion: '0.0.0',
    // timestampsFolderPath,
    isCI: false,
    isTTY: true,
    env: {},
    isRunningAsRoot: false,
    isInstalledAsRoot: false,
    isInstalledGlobally: false
  })

  await checker.clearTimestamp()
  await checker.initiateVersionRetrieval()
  t.ok(checker.latestVersionPromise !== undefined, 'promise created')

  await checker.notifyIfUpdateIsAvailable()
  t.ok(checker.returnedError !== undefined, 'has error')
  // console.log(uc.returnedError.message)

  t.end()
})

// ----------------------------------------------------------------------------
