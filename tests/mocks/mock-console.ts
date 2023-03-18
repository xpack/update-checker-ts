/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2017 Liviu Ionescu. All rights reserved.
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
 * Mock console.
 */

// ----------------------------------------------------------------------------

import { Console } from 'node:console'
import { Writable } from 'node:stream'

// ============================================================================

// https://nodejs.org/docs/latest-v14.x/api/console.html
export class MockConsole extends Console {
  lines: string[]

  constructor () {
    const stdoutStream = new Writable({
      write: (chunk, _encoding, callback) => {
        this.lines.push(chunk.toString())
        callback()
      }
    })
    // const stderrStream = new Writable({
    //   write: (chunk, _encoding, callback) => {
    //     this.lines.push(chunk.toString())
    //     callback()
    //   }
    // })
    // super(stdoutStream, stderrStream)
    super(stdoutStream)

    this.lines = []
  }

  override clear (): void {
    super.clear()

    this.lines = []
  }
}

// ----------------------------------------------------------------------------
