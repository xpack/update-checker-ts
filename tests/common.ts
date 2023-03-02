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

const util = require('util')

// ----------------------------------------------------------------------------

class MockLog {
  constructor () {
    this.lines = []
    this.isDebug = false
  }

  warning (msg = '', ...args) {
    const str = util.format(msg, ...args)
    this.lines.push('warning: ' + str)
  }

  info (msg = '', ...args) {
    const str = util.format(msg, ...args)
    this.lines.push(str)
  }

  debug (msg = '', ...args) {
    const str = util.format(msg, ...args)
    this.lines.push(str)
  }

  trace (msg = '', ...args) {
    const str = util.format(msg, ...args)
    this.lines.push(str)
  }

  clear () {
    this.lines = []
  }
}

// ----------------------------------------------------------------------------
// Node.js specific export definitions.

// By default, `module.exports = {}`.
// The Main class is added as a property to this object.

module.exports.MockLog = MockLog

// In ES6, it would be:
// export class MockLog { ... }
// ...
// import { MockLog } from 'common.js'

// ----------------------------------------------------------------------------
