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

'use strict'
/* eslint valid-jsdoc: "error" */
/* eslint max-len: [ "error", 80, { "ignoreUrls": true } ] */

// ----------------------------------------------------------------------------

/**
 * Test the data model for storing and processing commands.
 */

// ----------------------------------------------------------------------------

// const assert = require('assert')
const path = require('path')

// The `[node-tap](http://www.node-tap.org)` framework.
const test = require('tap').test

const MockLog = require('../common.js').MockLog

const UpdateChecker = require('../../index.js').UpdateChecker
const timestampSuffix = '-update-check'
const defaultCheckUpdatesIntervalSeconds = 24 * 60 * 60

// ----------------------------------------------------------------------------

test('asserts', (t) => {
  t.ok(UpdateChecker !== undefined, 'UpdateChecker is defined')
  t.ok(MockLog !== undefined, 'MockLog is defined')

  t.end()
})

test('constructor with values', (t) => {
  const mockLog = new MockLog()
  const ck = new UpdateChecker({
    log: mockLog,
    packageName: 'my-name',
    packageVersion: '1.2.3',
    timestampsFolderAbsolutePath: 'my-path'
  })
  t.ok(ck, 'created')
  t.match(mockLog.lines[0], 'UpdateChecker.constructor()', 'logged')
  t.equal(ck.packageName, 'my-name', 'name ok')
  t.equal(ck.packageVersion, '1.2.3', 'version ok')
  t.equal(ck.timestampsFolderAbsolutePath, 'my-path', 'folder path ok')
  const filePath = path.join('my-path', 'my-name' + timestampSuffix)
  t.equal(ck.timestampFileAbsolutePath, filePath, 'file path ok')

  t.ok(ck.timestampFileAbsolutePath.endsWith(timestampSuffix),
    'file suffix ok')
  t.equal(ck.checkUpdatesIntervalMilliseconds,
    defaultCheckUpdatesIntervalSeconds * 1000,
    'interval ok')

  t.end()
})

test('constructor without values', (t) => {
  const mockLog = new MockLog()

  t.throws(
    () => {
      const ck = new UpdateChecker()
      ck.log.trace()
    },
    'assert(params)',
    'assert(params) throws'
  )

  t.throws(
    () => {
      const ck = new UpdateChecker({
      })
      ck.log.trace()
    },
    'assert(params.log)',
    'assert(params.log) throws'
  )

  t.throws(
    () => {
      const ck = new UpdateChecker({
        log: mockLog
      })
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
      })
      ck.log.trace()
    },
    'assert(params.packageVersion)',
    'assert(params.packageVersion) throws'
  )

  t.end()
})

// ----------------------------------------------------------------------------
