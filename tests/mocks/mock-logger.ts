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

import { Logger } from '@xpack/logger'

// ----------------------------------------------------------------------------

import { MockConsole } from './mock-console.js'

export class MockLogger extends Logger {
  get lines (): string[] {
    return (this.console as MockConsole).lines
  }

  clear (): void {
    this.console.clear()
  }
}

// ----------------------------------------------------------------------------
