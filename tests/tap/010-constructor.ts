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

// import { strict as assert } from 'node:assert'
import * as path from 'node:path'

// The `[node-tap](http://www.node-tap.org)` framework.
import { test } from 'tap'

// ----------------------------------------------------------------------------

import { MockConsole } from '../mocks/mock-console.js'
import { MockLogger } from '../mocks/mock-logger.js'

import { UpdateChecker } from '../../src/index.js'
import { UpdateCheckerConstructorParameters } from '../../dist/index.js'

// ----------------------------------------------------------------------------

const timestampSuffix = '-update-check'
const defaultCheckUpdatesIntervalSeconds = 24 * 60 * 60

// ----------------------------------------------------------------------------

await test('asserts', (t) => {
  t.ok(UpdateChecker !== undefined, 'UpdateChecker is defined')
  t.ok(MockConsole !== undefined, 'MockConsole is defined')
  t.ok(MockLogger !== undefined, 'MockLogger is defined')

  t.end()
})

await test('constructor with values', (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole, level: 'trace' })

  const checker = new UpdateChecker({
    log: mockLog,
    packageName: 'my-name',
    packageVersion: '1.2.3',
    timestampsFolderPath: 'my-path'
  })
  t.ok(checker, 'created')
  // console.log(mockLog.lines)
  t.match(mockLog.lines[1], 'UpdateChecker.constructor()', 'logged')
  t.equal(checker.packageName, 'my-name', 'name ok')
  t.equal(checker.packageVersion, '1.2.3', 'version ok')
  t.equal(checker.timestampsFolderPath, 'my-path', 'folder path ok')
  const filePath = path.join('my-path', 'my-name' + timestampSuffix)
  t.equal(checker.timestampFilePath, filePath, 'file path ok')

  t.ok(checker.timestampFilePath.endsWith(timestampSuffix),
    'file suffix ok')
  t.equal(checker.checkUpdatesIntervalMilliseconds,
    defaultCheckUpdatesIntervalSeconds * 1000,
    'interval ok')

  t.end()
})

await test('constructor without values', (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole })

  t.throws(
    () => {
      const ck = new UpdateChecker(
        undefined as unknown as UpdateCheckerConstructorParameters)
      ck.log.trace()
    },
    'assert(params)',
    'assert(params) throws'
  )

  t.throws(
    () => {
      const ck = new UpdateChecker({
      } as unknown as UpdateCheckerConstructorParameters)
      ck.log.trace()
    },
    'assert(params.log)',
    'assert(params.log) throws'
  )

  t.throws(
    () => {
      const ck = new UpdateChecker({
        log: mockLog
      } as unknown as UpdateCheckerConstructorParameters)
      ck.log.trace()
    },
    'assert(params.packageName)',
    'assert(params.packageName) throws'
  )

  t.throws(
    () => {
      const ck = new UpdateChecker({
        log: mockLog,
        packageName: 'my-name'
      } as unknown as UpdateCheckerConstructorParameters)
      ck.log.trace()
    },
    'assert(params.packageVersion)',
    'assert(params.packageVersion) throws'
  )

  t.end()
})

// ----------------------------------------------------------------------------
