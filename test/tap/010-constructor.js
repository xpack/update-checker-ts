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
  t.true(UpdateChecker !== undefined, 'UpdateChecker is defined')
  t.true(MockLog !== undefined, 'MockLog is defined')

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
  t.true(ck, 'created')
  t.match(mockLog.lines[0], 'UpdateChecker.constructor()', 'logged')
  t.equal(ck.packageName, 'my-name', 'name ok')
  t.equal(ck.packageVersion, '1.2.3', 'version ok')
  t.equal(ck.timestampsFolderAbsolutePath, 'my-path', 'folder path ok')
  const filePath = path.join('my-path', 'my-name' + timestampSuffix)
  t.equal(ck.timestampFileAbsolutePath, filePath, 'file path ok')

  t.true(ck.timestampFileAbsolutePath.endsWith(timestampSuffix),
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
