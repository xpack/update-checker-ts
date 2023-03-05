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

/**
 * This file implements a class to check if a new version of a
 * package is available, and notify the user via the log.
 */

// ----------------------------------------------------------------------------

// https://nodejs.org/docs/latest-v14.x/api/
import { strict as assert } from 'node:assert'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

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

/**
 * Type of the object defining the parameters to be passed to the
 * **UpdateChecker** constructor.
 */
export interface UpdateCheckerConstructorParameters {
  /** A reference to a Logger instance. */
  log: Logger
  /**
   * A string with the full package name, as from the `name`
   * property in the `package.json` file.
   */
  packageName: string
  /**
   * A string with the package version, in semver, as from the
   * `version` property in the `package.json` file.
   */
  packageVersion: string
  /**
   * A string with the path to the folder where the timestamps are located.
   *
   * If missing, by default, timestamps are created in
   * the `$HOME/.config/timestamps` folder.
   */
  timestampsFolderPath?: string
  /**
   * A number with the minimum interval between checks,
   * in milliseconds,
   *
   * If missing, by default, checks are performed no sooner than
   * 24 hours.
   */
  checkUpdatesIntervalSeconds?: number
}

/**
 * @ignore
 * @summary Environment used during tests.
 */
export interface UpdateCheckerTestEnvironment {
  env?: any
  isCI?: boolean
  isTTY?: boolean
  isRunningAsRoot?: boolean
  isInstalledGlobally?: boolean
  isInstalledAsRoot?: boolean
}

/**
 * @summary The **UpdateChecker** class can be used to check and notify if
 *   there is a newer version of a **npm** package.
 *
 * @description
 * Checking the version requires an access to the packages registry,
 * which might take some time to complete.
 *
 * Given that the result is needed later, before exiting,
 * the operation can be started asynchronously and awaited at the end.
 */
export class UpdateChecker {
  // --------------------------------------------------------------------------

  /**
   * @summary The latest version of the package.
   *
   * @description
   * This variable holds the result of calling the
   * [`latest-version`](https://www.npmjs.com/package/latest-version) module.
   *
   * The content is a string in semver format.
   */
  latestVersion: string | undefined = undefined
  /**
   * @summary The absolute path to the timestamp file.
   *
   * @description
   * To avoid repeating the check too often, the timestamp of the
   * latest check is remembered as the creation file of a file, in
   * the `$HOME/.config/timestamps` folder.
   *
   * The content is a string with the absolute path of the file created
   * after checking the version.
   */
  timestampFilePath: string
  /**
   * @summary The possible error returned while retrieving the version.
   *
   * @description
   * In case an error occurs while retrieving the version, the error
   * message is logged, but the `Error` object is also stored in this
   * variable, accessible to the caller.
   */
  returnedError: any | undefined = undefined

  /** A reference to a Logger instance. */
  protected log: Logger
  /** A string with the full package name, as from the `package.json`. */
  protected packageName: string
  /** A string with the package version, in semver, as from the
   * `package.json`. */
  protected packageVersion: string
  /** A string with the path to the folder where the stamps are created. */
  protected timestampsFolderPath: string
  /** A number with the minimum interval to check for the updates,
   * in milliseconds */
  protected checkUpdatesIntervalMilliseconds: number
  /** A promise which resolves to a string with the latest version. */
  protected latestVersionPromise: Promise<string> | undefined = undefined

  /** A map with environment variables. */
  protected processEnv: any
  /** A boolean True when running in a CI environment. */
  protected isCI: boolean = false
  /** A boolean True when running in a terminal. */
  protected isTTY: boolean = false
  /** A boolean True when running with administrative credentials. */
  protected isRunningAsRoot: boolean = false
  /** A boolean True when the package is installed globally. */
  protected isInstalledGlobally: boolean = false
  /** A boolean True when the package is installed with
   * administrative rights. */
  protected isInstalledAsRoot: boolean = false

  // --------------------------------------------------------------------------
  // Static properties.

  /**
   * @summary Mock environment to be used during tests.
   *
   * @description
   * This property is normally undefined, but it can be
   * set to a mock environment, during tests.
   */
  static testEnvironment: UpdateCheckerTestEnvironment | undefined

  // --------------------------------------------------------------------------
  // Constructor.

  /**
   * @summary Create an **UpdateChecker** instance.
   *
   * @param params The generic object used to pass parameters to the
   * constructor.
   *
   * @description
   * This function initialises the internal variables with lots of
   * conditions tested later to determine if the update must be performed.
   *
   * To improve testability, a mock environment can be passed via a
   * a static property.
   */
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
    this.processEnv = UpdateChecker.testEnvironment?.env ?? process.env ?? {}

    if (UpdateChecker.testEnvironment?.isCI !== undefined) {
      this.isCI = UpdateChecker.testEnvironment?.isCI
    } else {
      this.isCI = isCI
    }

    if (UpdateChecker.testEnvironment?.isTTY !== undefined) {
      this.isTTY = UpdateChecker.testEnvironment.isTTY
    } else {
      this.isTTY = process.stdout.isTTY
    }

    if (UpdateChecker.testEnvironment?.isRunningAsRoot !== undefined) {
      this.isRunningAsRoot = UpdateChecker.testEnvironment.isRunningAsRoot
    } else {
      /* istanbul ignore next */
      if (os.platform() !== 'win32') {
        this.isRunningAsRoot =
          process.geteuid !== undefined &&
          process.geteuid() !== process.getuid()
      } /* c8 ignore start */ else {
        /* istanbul ignore next */
        this.isRunningAsRoot = false
      } /* c8 ignore stop */
    }

    if (UpdateChecker.testEnvironment?.isInstalledGlobally !== undefined) {
      this.isInstalledGlobally =
        UpdateChecker.testEnvironment.isInstalledGlobally
    } else {
      this.isInstalledGlobally = isInstalledGlobally
    }

    if (UpdateChecker.testEnvironment?.isInstalledAsRoot !== undefined) {
      this.isInstalledAsRoot = UpdateChecker.testEnvironment.isInstalledAsRoot
    } else {
      this.isInstalledAsRoot = false
      /* istanbul ignore next */
      if (os.platform() !== 'win32') {
        const dirname = path.dirname(fileURLToPath(import.meta.url))
        /* c8 ignore start */
        if (this.isInstalledGlobally &&
          isPathInside(dirname, '/usr/local')) {
          // May not be very reliable if installed in another system location.
          this.isInstalledAsRoot = false
        }
        /* c8 ignore stop */
      }
    }
  }

  /**
   * @summary Initiate the asynchronous procedure to retrieve the version.
   *
   * @returns Nothing.
   *
   * @description
   * The operation is performed by the third party package
   * [`latest-version`](https://www.npmjs.com/package/latest-version),
   * which accesses the location where the package is stored
   * (like the `npmjs.com` server, or GitHub).
   *
   * Since this is a potentially long operation, it is expected to be
   * started at the
   * beginning of a CLI application and completed at the end, giving
   * it a good chance to run in parallel.
   *
   * The operation is **not** started if it is considered
   * not useful, like when running in a CI environment,
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
      this.processEnv[envName] !== undefined) {
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
   * @summary Compare the versions and notify if an update is available.
   *
   * @returns Nothing.
   *
   * @description
   * Await for the actual version to be retrieved, compare it with the
   * current version, possibly notify and create a new timestamp.
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

      // Clear the variable to prevent further calls.
      this.latestVersionPromise = undefined

      this.latestVersion = latestVersion

      if (semver.gt(latestVersion, this.packageVersion)) {
      // If the latest version is greater, send the notification.
        this.sendNotification()
      }

      if (this.isRunningAsRoot) {
        // When running as root, skip writing the timestamp to avoid
        // later EACCES or EPERM. The effect is that the check will
        // be performed with each run.
        /* istanbul ignore next */
        if (os.platform() !== 'win32') {
          log.trace(`${this.constructor.name}:` +
          ` geteuid() ${process.geteuid()} != ${process.getuid()}`)
        } /* c8 ignore start */ else {
          /* istanbul ignore next */
          log.trace(`${this.constructor.name}: running as administrator`)
        } /* c8 ignore stop */
        return
      }
    } catch (err: any) {
      if (log.isDebug) {
        log.debug(err)
      } else {
        log.warn(err.message)
      }
      // Also return the error to the caller.
      this.returnedError = err
    }

    try {
      await this.clearTimestamp()

      await this.createTimestamp()

      log.debug(`${this.constructor.name}.checkUpdate()` +
      ` timestamp ${this.timestampFilePath} created`)
    } /* c8 ignore start */ catch (err) /* istanbul ignore next */ {
      log.debug(err)
    } /* c8 ignore stop */
  }

  /**
   * @summary Send the notification message.
   *
   * @return Nothing.
   *
   * @description
   * The notification message is composed using the values stored
   * in the instance properties.
   *
   * The message is sent by writing to the log.
   * This can be silenced by changing the log level.
   *
   * The notification message looks like this:
   *
   * ```text
   * >>> New version 0.14.9 -> 0.15.0 available. <<<
   * >>> Run 'npm install --global xpm@0.15.0' to update. <<<
   * ```
   *
   * To customise this message, this function can be redefined
   * in a class derived from this one.
   *
   * @override
   */
  sendNotification (): void {
    const log = this.log
    log.trace(`${this.constructor.name}.sendNotification()`)

    const isGlobalStr = this.isInstalledGlobally ? ' --global' : ''

    assert(this.latestVersion)
    let message = '\n'
    message += `>>> New version ${this.packageVersion} -> `
    message += `${this.latestVersion} available. <<<\n`
    message += ">>> Run '"
    if (this.isInstalledAsRoot) {
      message += 'sudo '
    }
    message += `npm install${isGlobalStr} ${this.packageName}' to update. <<<`

    log.info(message)
  }

  /**
   * @summary Check if a subsequent test is too soon.
   *
   * @param ageMilliseconds Age in milliseconds.
   * @returns True if there is no timestamp or if it is older
   *  than the given age.
   *
   * @description
   * Compute the timestamp age (as the time difference between the current
   * time and the timestamp) and compare to the given age.
   */
  protected async didIntervalExpire (
    ageMilliseconds: number
  ): Promise<boolean> {
    assert(ageMilliseconds > 0)
    const log = this.log

    const stats = await this.readTimestampFileStats()
    if (stats != null) {
      const deltaMillis = Date.now() - stats.mtime.valueOf()
      if (deltaMillis < ageMilliseconds) {
        log.trace(`${this.constructor.name}: update timeout did not expire ` +
          `${Math.floor(deltaMillis / 1000)} ` +
          `< ${Math.floor(ageMilliseconds / 1000)}`)
        return false
      }
    } else {
      log.trace(`${this.constructor.name}:` +
        ' there is no previous update timestamp.')
    }

    return true
  }

  /**
   * @summary Read the stats of the timestamp file.
   *
   * @returns A promise that resolves to a fs.Stats object or null.
   */
  protected async readTimestampFileStats (): Promise<fs.Stats | null> {
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
   * @summary Remove the file used as timestamp.
   *
   * @returns Nothing.
   *
   * @description
   * The main reason for this to be a separate function is testability.
   */
  protected async clearTimestamp (): Promise<void> {
    const log = this.log
    log.trace(`${this.constructor.name}.clearTimestamp()`)

    await deleteAsync(this.timestampFilePath, { force: true })
  }

  /**
   * @summary Create the file used as timestamp.
   *
   * @returns Nothing.
   *
   * @description
   * Create an empty file. The timestamp is the creation date.
   */
  protected async createTimestamp (): Promise<void> {
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
