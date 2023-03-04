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

// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------

// https://nodejs.org/docs/latest-v14.x/api/
import { strict as assert } from 'node:assert'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

// ----------------------------------------------------------------------------

// https://www.npmjs.com/package/@xpack/logger
import { Logger } from '@xpack/logger'

// https://www.npmjs.com/package/del
import { deleteAsync } from 'del'

// https://www.npmjs.com/package/is-ci
// Used in place.
import isCI from 'is-ci'

// https://www.npmjs.com/package/is-installed-globally
// Used in place.
import isInstalledGlobally from 'is-installed-globally'

// https://www.npmjs.com/package/is-path-inside
// Note v4 no longer supports `require()`, but `import`.
import isPathInside from 'is-path-inside'

// https://www.npmjs.com/package/make-dir
import makeDir from 'make-dir'

// https://www.npmjs.com/package/latest-version
import latestVersionPromise from 'latest-version'

// https://www.npmjs.com/package/semver
import * as semver from 'semver'

// ----------------------------------------------------------------------------

const fsPromises = fs.promises

// ----------------------------------------------------------------------------

// Modules that return a Boolean. Used in place.

// Default variables.
const timestampsFolderPath: string = path.join(os.homedir(), '.config',
  'timestamps')
const timestampSuffix: string = '-update-check'
const defaultCheckUpdatesIntervalSeconds: number = 24 * 60 * 60

// ============================================================================

export interface UpdateCheckerConstructorParameters {
  log: Logger
  packageName: string
  packageVersion: string
  timestampsFolderPath?: string
  checkUpdatesIntervalSeconds?: number
  env?: any
  isCI?: boolean
  isTTY?: boolean
  isRunningAsRoot?: boolean
  isInstalledGlobally?: boolean
  isInstalledAsRoot?: boolean
}

export class UpdateChecker {
  // --------------------------------------------------------------------------

  log: Logger
  packageName: string
  packageVersion: string
  latestVersion: string | undefined = undefined

  timestampsFolderPath: string
  timestampFilePath: string
  checkUpdatesIntervalMilliseconds: number

  protected processEnv: any
  protected isCI: boolean = false
  protected isTTY: boolean = false
  protected isRunningAsRoot: boolean = false
  protected isInstalledGlobally: boolean = false
  protected isInstalledAsRoot: boolean = false

  latestVersionPromise: Promise<string> | undefined = undefined
  returnedError: any | undefined = undefined

  // Constructor: use parent definition.
  constructor (params: UpdateCheckerConstructorParameters) {
    assert(params)

    assert(params.log)
    this.log = params.log

    const log = this.log
    log.trace(`${this.constructor.name}.constructor()`)

    assert(params.packageName)
    this.packageName = params.packageName

    assert(params.packageVersion)
    this.packageVersion = params.packageVersion

    // Optional parameters.
    this.timestampsFolderPath = params.timestampsFolderPath ??
      timestampsFolderPath

    // Uses the folder path.
    this.timestampFilePath = path.join(
      this.timestampsFolderPath,
      this.packageName + timestampSuffix
    )

    this.checkUpdatesIntervalMilliseconds =
      (params.checkUpdatesIntervalSeconds ??
        defaultCheckUpdatesIntervalSeconds) * 1000

    // For testability reasons, allow to override some conditions.
    // This may be also used for special environments and use cases.
    this.processEnv = params.env ?? process.env ?? {}

    if (Object.prototype.hasOwnProperty.call(params, 'isCI') &&
      params.isCI !== undefined) {
      this.isCI = params.isCI
    } else {
      this.isCI = isCI
    }

    if (Object.prototype.hasOwnProperty.call(params, 'isTTY') &&
    params.isTTY !== undefined) {
      this.isTTY = params.isTTY
    } else {
      this.isTTY = process.stdout.isTTY
    }

    if (Object.prototype.hasOwnProperty.call(params, 'isRunningAsRoot') &&
    params.isRunningAsRoot !== undefined) {
      this.isRunningAsRoot = params.isRunningAsRoot
    } else {
      /* istanbul ignore next */
      if (os.platform() !== 'win32') {
        this.isRunningAsRoot =
          process.geteuid !== undefined &&
          process.geteuid() !== process.getuid()
      } else {
        /* istanbul ignore next */
        this.isRunningAsRoot = false
      }
    }

    if (Object.prototype.hasOwnProperty.call(params, 'isInstalledGlobally') &&
    params.isInstalledGlobally !== undefined) {
      this.isInstalledGlobally = params.isInstalledGlobally
    } else {
      this.isInstalledGlobally = isInstalledGlobally
    }

    if (Object.prototype.hasOwnProperty.call(params, 'isInstalledAsRoot') &&
    params.isInstalledAsRoot !== undefined) {
      this.isInstalledAsRoot = params.isInstalledAsRoot
    } else {
      this.isInstalledAsRoot = false
      /* istanbul ignore next */
      if (os.platform() !== 'win32') {
        if (this.isInstalledGlobally &&
          isPathInside(__dirname, '/usr/local')) {
          // May not be very reliable if installed in another system location.
          this.isInstalledAsRoot = false
        }
      }
    }
  }

  /**
   * @summary Initiate a procedure to retrieve the version.
   *
   * @returns Nothing.
   *
   * @description
   * Since this is a potentially long operation, it is initiated at the
   * beginning and executed at the end, giving it a chance to run in
   * parallel.
   *
   * The operation is not started when running in a CI environment,
   * when not running from a console, or the environment variable
   * `NO_NPM_UPDATE_NOTIFIER` is defined.
   */
  async initiateVersionRetrieval (): Promise<void> {
    const log = this.log
    log.trace(`${this.constructor.name}.initiateVersionRetrieval()`)

    this.latestVersionPromise = undefined

    const envName = 'NO_NPM_UPDATE_NOTIFIER'
    if (this.checkUpdatesIntervalMilliseconds === 0 ||
      this.isCI ||
      !this.isTTY ||
      Object.prototype.hasOwnProperty.call(this.processEnv, envName)) {
      log.trace(`${this.constructor.name}:` +
        ' do not fetch latest version number.')
      return
    }

    if (await this.didIntervalExpire(this.checkUpdatesIntervalMilliseconds)) {
      log.trace(`${this.constructor.name}:` +
        ' fetching latest version number...')

      // Create the promise, do not wait for it yet.
      this.latestVersionPromise = latestVersionPromise(this.packageName)
    }
  }

  /**
   * @summary Compare versions and notify if an update is available.
   *
   * @returns Nothing.
   *
   * @description
   * Await for the actual version to be retrieved, compare with the
   * current version, possibly notify and write a new timestamp.
   */
  async notifyIfUpdateIsAvailable (): Promise<void> {
    const log = this.log
    log.trace(`${this.constructor.name}.notifyIfUpdateIsAvailable()`)

    if (this.latestVersionPromise == null) {
      log.trace(`${this.constructor.name}:` +
        ' latestVersionPromise not defined, update silently ignored.')
      // If the promise was not created, no action.
      return
    }

    let latestVersion: string
    try {
      // Actively await for the promise to complete.
      latestVersion = await this.latestVersionPromise

      log.trace(`${this.constructor.name}:` +
      ` latest ${this.packageName}${latestVersion}`)

      // Prevent further calls.
      this.latestVersionPromise = undefined

      if (semver.gt(latestVersion, this.packageVersion)) {
      // If versions differ, send the notification.
        this.sendNotification(latestVersion)
      }

      this.latestVersion = latestVersion

      if (this.isRunningAsRoot) {
      // When running as root, skip writing the timestamp to avoid
      // later EACCES or EPERM. The effect is that the check will
      // be performed with each run.
      /* istanbul ignore next */
        if (os.platform() !== 'win32') {
          log.trace(`${this.constructor.name}:` +
          ` geteuid() ${process.geteuid()} != ${process.getuid()}`)
        } else {
        /* istanbul ignore next */
          log.trace(`${this.constructor.name}: running as administrator`)
        }
        return
      }
    } catch (err: any) {
      if (log.isDebug) {
        log.debug(err)
      } else {
        log.warn(err.message)
      }
      this.returnedError = err
    }

    try {
      await this.clearTimestamp()

      await this.createTimestamp()

      log.debug(`${this.constructor.name}.checkUpdate()` +
      ` timestamp ${this.timestampFilePath} created`)
    } catch (err) /* istanbul ignore next */ {
      log.debug(err)
    }
  }

  /**
   * @summary Send the notification message.
   *
   * @param latestVersion A string with the latest version,
   *  in semver format.
   * @return Nothing.
   *
   * @description
   * The notification is sent by writing to the log.
   * This can be silenced by changing the log level.
   * To customise the behaviour, this function can be redefined
   * in a class derived from this one.
   *
   * @override
   */
  sendNotification (latestVersion: string): void {
    const log = this.log
    log.trace(`${this.constructor.name}.sendNotification()`)

    const isGlobalStr = this.isInstalledGlobally ? ' --global' : ''

    let msg = '\n'
    msg += `>>> New version ${this.packageVersion} -> `
    msg += `${latestVersion} available. <<<\n`
    msg += ">>> Run '"
    if (this.isInstalledAsRoot) {
      msg += 'sudo '
    }
    msg += `npm install${isGlobalStr} ${this.packageName}' to update. <<<`

    log.info(msg)
  }

  /**
   * @summary Check if a subsequent test is too soon.
   *
   * @param ageMillis Number of milliseconds.
   * @returns True if there is no timestamp or if it is older
   *  than the given age.
   */
  protected async didIntervalExpire (ageMillis: number): Promise<boolean> {
    assert(ageMillis > 0)
    const log = this.log

    const stats = await this.readTimestamp()
    if (stats != null) {
      const deltaMillis = Date.now() - stats.mtime.valueOf()
      if (deltaMillis < ageMillis) {
        log.trace(`${this.constructor.name}: update timeout did not expire ` +
          `${Math.floor(deltaMillis / 1000)} ` +
          `< ${Math.floor(ageMillis / 1000)}`)
        return false
      }
    } else {
      log.trace(`${this.constructor.name}:` +
        ' there is no previous update timestamp.')
    }

    return true
  }

  async readTimestamp (): Promise<fs.Stats | null> {
    const log = this.log

    try {
      const stats = await fsPromises.stat(this.timestampFilePath)
      log.trace(`${this.constructor.name}.readTimestamp() ok`)
      return stats
    } catch (err: any) {
      // File not found.
      // console.log(ex)
    }
    log.trace(`${this.constructor.name}.readTimestamp() failed`)
    return null
  }

  /**
   * @summary Remove the file used as timestamp
   *
   * @returns Nothing.
   *
   * @description
   * The main reason this is a separate function is testability.
   */
  async clearTimestamp (): Promise<void> {
    const log = this.log
    log.trace(`${this.constructor.name}.clearTimestamp()`)

    await deleteAsync(this.timestampFilePath, { force: true })
  }

  async createTimestamp (): Promise<void> {
    const log = this.log
    log.trace(`${this.constructor.name}.createTimestamp()`)

    // Ensure the parent folder is present.
    await makeDir(path.dirname(this.timestampFilePath))

    // Create an empty file; the content is ignored,
    // only the modified date is of interest.
    const fd = await fsPromises.open(this.timestampFilePath, 'w')
    await fd.close()
  }
}

// ----------------------------------------------------------------------------
