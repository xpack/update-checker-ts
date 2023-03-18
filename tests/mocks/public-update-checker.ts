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

import * as fs from 'node:fs'

// ----------------------------------------------------------------------------

// https://www.npmjs.com/package/@xpack/logger
import { Logger } from '@xpack/logger'

import {
  UpdateChecker

} from '../../src/index.js'

// ----------------------------------------------------------------------------

export class PublicUpdateChecker extends UpdateChecker {
  getLog (): Logger {
    return this.log
  }

  getPackageName (): string {
    return this.packageName
  }

  getPackageVersion (): string {
    return this.packageVersion
  }

  getTimestampsFolderPath (): string {
    return this.timestampsFolderPath
  }

  getCheckUpdatesIntervalMilliseconds (): number {
    return this.checkUpdatesIntervalMilliseconds
  }

  setCheckUpdatesIntervalMilliseconds (milliseconds: number): void {
    this.checkUpdatesIntervalMilliseconds = milliseconds
  }

  getLatestVersionPromise (): Promise<string> | undefined {
    return this.latestVersionPromise
  }
  // --------------------------------------------------------------------------

  override async clearTimestamp (): Promise<void> {
    await super.clearTimestamp()
  }

  override async readTimestampFileStats (): Promise<fs.Stats | null> {
    return await super.readTimestampFileStats()
  }
}

// ----------------------------------------------------------------------------
