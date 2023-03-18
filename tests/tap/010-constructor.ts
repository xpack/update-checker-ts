/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2019 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/license/mit/.
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
import { PublicUpdateChecker } from '../mocks/public-update-checker.js'

import { UpdateChecker } from '../../src/index.js'

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

  UpdateChecker.testEnvironment = undefined

  const checker = new PublicUpdateChecker({
    log: mockLog,
    packageName: 'my-name',
    packageVersion: '1.2.3',
    timestampsFolderPath: 'my-path'
  })
  t.ok(checker, 'created')
  // console.log(mockLog.lines)
  t.match(mockLog.lines[1], 'UpdateChecker.constructor()', 'logged')
  t.equal(checker.getPackageName(), 'my-name', 'name ok')
  t.equal(checker.getPackageVersion(), '1.2.3', 'version ok')
  t.equal(checker.getTimestampsFolderPath(), 'my-path', 'folder path ok')
  const filePath = path.join('my-path', 'my-name' + timestampSuffix)
  t.equal(checker.timestampFilePath, filePath, 'file path ok')

  t.ok(checker.timestampFilePath.endsWith(timestampSuffix),
    'file suffix ok')
  t.equal(checker.getCheckUpdatesIntervalMilliseconds(),
    defaultCheckUpdatesIntervalSeconds * 1000,
    'interval ok')

  t.end()
})

await test('constructor without values', (t) => {
  const mockConsole = new MockConsole()
  const mockLog = new MockLogger({ console: mockConsole })

  UpdateChecker.testEnvironment = undefined

  t.throws(
    () => {
      // @ts-expect-error
      const checker = new PublicUpdateChecker(undefined)
      checker.getLog().trace()
    },
    'assert(params)',
    'assert(params) throws'
  )

  t.throws(
    () => {
      // @ts-expect-error
      const checker = new PublicUpdateChecker({})
      checker.getLog().trace()
    },
    'assert(params.log)',
    'assert(params.log) throws'
  )

  t.throws(
    () => {
      // @ts-expect-error
      const checker = new PublicUpdateChecker({
        log: mockLog
      })
      checker.getLog().trace()
    },
    'assert(params.packageName)',
    'assert(params.packageName) throws'
  )

  t.throws(
    () => {
      // @ts-expect-error
      const checker = new PublicUpdateChecker({
        log: mockLog,
        packageName: 'my-name'
      })
      checker.getLog().trace()
    },
    'assert(params.packageVersion)',
    'assert(params.packageVersion) throws'
  )

  t.end()
})

// ----------------------------------------------------------------------------
