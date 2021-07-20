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

// https://nodejs.org/docs/latest-v10.x/api/
const assert = require('assert')
const os = require('os')
const path = require('path')
const fsPromises = require('fs').promises

// ----------------------------------------------------------------------------

// https://www.npmjs.com/package/latest-version
const latestVersionPromise = require('latest-version')

// https://www.npmjs.com/package/is-path-inside
// Note v4 no longer supports `require()`, but `import`.
const isPathInside = require('is-path-inside')

// https://www.npmjs.com/package/semver
const semver = require('semver')

// https://www.npmjs.com/package/del
const del = require('del')

// https://www.npmjs.com/package/make-dir
const makeDir = require('make-dir')

// ----------------------------------------------------------------------------

// Modules that return a Boolean. Used in place.
// const isInstalledGlobally = require('is-installed-globally')
// const isCI = require('is-ci')

// Default variables.
const timestampsFolderAbsolutePath = path.join(os.homedir(), '.config',
  'npm-timestamps')
const timestampSuffix = '-update-check'
const defaultCheckUpdatesIntervalSeconds = 24 * 60 * 60

// ============================================================================

// export
class UpdateChecker {
  // --------------------------------------------------------------------------

  // Constructor: use parent definition.
  constructor (params) {
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
    this.timestampsFolderAbsolutePath = params.timestampsFolderAbsolutePath ||
      timestampsFolderAbsolutePath

    // Uses the folder path.
    this.timestampFileAbsolutePath = path.join(
      this.timestampsFolderAbsolutePath,
      this.packageName + timestampSuffix
    )

    this.checkUpdatesIntervalMilliseconds =
      (params.checkUpdatesIntervalSeconds ||
        defaultCheckUpdatesIntervalSeconds) * 1000

    this.private_ = {}

    // For testability reasons, allow to override some conditions.
    // This may be also used for special environments and use cases.
    this.private_.processEnv = params.env || process.env || {}

    if (Object.prototype.hasOwnProperty.call(params, 'isCI')) {
      this.private_.isCI = params.isCI
    } else {
      this.private_.isCI = require('is-ci')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'isTTY')) {
      this.private_.isTTY = params.isTTY
    } else {
      this.private_.isTTY = process.stdout.isTTY
    }

    if (Object.prototype.hasOwnProperty.call(params, 'isRunningAsRoot')) {
      this.private_.isRunningAsRoot = params.isRunningAsRoot
    } else {
      /* istanbul ignore next */
      if (os.platform() !== 'win32') {
        this.private_.isRunningAsRoot =
          process.geteuid && process.geteuid() !== process.getuid()
      } else {
        /* istanbul ignore next */
        this.private_.isRunningAsRoot = false
      }
    }

    if (Object.prototype.hasOwnProperty.call(params, 'isInstalledGlobally')) {
      this.private_.isInstalledGlobally = params.isInstalledGlobally
    } else {
      this.private_.isInstalledGlobally = require('is-installed-globally')
    }

    if (Object.prototype.hasOwnProperty.call(params, 'isInstalledAsRoot')) {
      this.private_.isInstalledAsRoot = params.isInstalledAsRoot
    } else {
      this.private_.isInstalledAsRoot = false
      /* istanbul ignore next */
      if (os.platform() !== 'win32') {
        if (this.private_.isInstalledGlobally &&
          isPathInside(__dirname, '/usr/local')) {
          // May not be very reliable if installed in another system location.
          this.private_.isInstalledAsRoot = false
        }
      }
    }
  }

  /**
   * @summary Initiate a procedure to retrieve the version.
   *
   * @returns {undefined} Nothing.
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
  async initiateVersionRetrieval () {
    const log = this.log
    log.trace(`${this.constructor.name}.initiateVersionRetrieval()`)

    this.latestVersionPromise = undefined

    const envName = 'NO_NPM_UPDATE_NOTIFIER'
    if (this.checkUpdatesIntervalMilliseconds === 0 ||
      this.private_.isCI ||
      !this.private_.isTTY ||
      Object.prototype.hasOwnProperty.call(this.private_.processEnv, envName)) {
      log.trace(`${this.constructor.name}:` +
        ' do not fetch latest version number.')
      return
    }

    if (await this.didIntervalExpire_(this.checkUpdatesIntervalMilliseconds)) {
      log.trace(`${this.constructor.name}:` +
        ' fetching latest version number...')

      // Create the promise, do not wait for it yet.
      this.latestVersionPromise = this.prepareLatestVersionPromise()
    }
  }

  /**
   * @summary Create the promise to get the latest version.
   *
   * @returns {Promise} A promise to retrieve the version.
   */
  prepareLatestVersionPromise () {
    return latestVersionPromise(this.packageName)
  }

  /**
   * @summary Compare versions and notify if an update is available.
   *
   * @returns {undefined} Nothing.
   *
   * @description
   * Await for the actual version to be retrieved, compare with the
   * current version, possibly notify and write a new timestamp.
   */
  async notifyIfUpdateIsAvailable () {
    const log = this.log
    log.trace(`${this.constructor.name}.notifyIfUpdateIsAvailable()`)

    if (!this.latestVersionPromise) {
      log.trace(`${this.constructor.name}:` +
        ' latestVersionPromise not defined, update silently ignored.')
      // If the promise was not created, no action.
      return
    }

    let latestVersion
    try {
      // Actively await for the promise to complete.
      latestVersion = await this.latestVersionPromise
    } catch (err) {
      if (log.isDebug) {
        log.debug(err)
      } else {
        log.warning(err.message)
      }
      this.returnedError = err
      return
    }

    log.trace(`${this.constructor.name}:` +
      ` latest ${this.packageName}${latestVersion}`)

    // Prevent further calls.
    this.latestVersionPromise = undefined

    if (semver.gt(latestVersion, this.packageVersion)) {
      // If versions differ, send the notification.
      this.sendNotification(latestVersion)
    }

    this.latestVersion = latestVersion

    if (this.private_.isRunningAsRoot) {
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

    await this.clearTimestamp()

    await this.createTimestamp()

    log.debug(`${this.constructor.name}.checkUpdate()` +
      ` timestamp ${this.timestampFileAbsolutePath} created`)
  }

  /**
   * @summary Send the notification message.
   *
   * @param {String} latestVersion A string with the latest version,
   *  in semver format.
   * @return {undefined} Nothing.
   *
   * @description
   * The notification is sent by writing to the log.
   * This can be silenced by changing the log level.
   * To customise the behaviour, this function can be redefined
   * in a class derived from this one.
   *
   * @override
   */
  sendNotification (latestVersion) {
    const log = this.log
    log.trace(`${this.constructor.name}.sendNotification()`)

    const isGlobalStr = this.private_.isInstalledGlobally ? ' --global' : ''

    let msg = '\n'
    msg += `>>> New version ${this.packageVersion} -> `
    msg += `${latestVersion} available. <<<\n`
    msg += ">>> Run '"
    if (this.private_.isInstalledAsRoot) {
      msg += 'sudo '
    }
    msg += `npm install${isGlobalStr} ${this.packageName}' to update. <<<`

    log.info(msg)
  }

  /**
   * @summary Check if a subsequent test is too soon.
   *
   * @param {Number} ageMillis Number of milliseconds.
   * @returns {Boolean} True if there is no timestamp or if it is older
   *  than the given age.
   */
  async didIntervalExpire_ (ageMillis) {
    assert(ageMillis > 0)
    const log = this.log

    const stats = await this.readTimestamp()
    if (stats) {
      const millisDelta = Date.now() - stats.mtime
      if (millisDelta < ageMillis) {
        log.trace(`${this.constructor.name}: update timeout did not expire ` +
          `${Math.floor(millisDelta / 1000)} ` +
          `< ${Math.floor(ageMillis / 1000)}`)
        return false
      }
    } else {
      log.trace(`${this.constructor.name}:` +
        ' there is no previous update timestamp.')
    }

    return true
  }

  async readTimestamp () {
    const log = this.log

    try {
      const stats = await fsPromises.stat(this.timestampFileAbsolutePath)
      log.trace(`${this.constructor.name}.readTimestamp() ok`)
      return stats
    } catch (ex) {
      // File not found.
      // console.log(ex)
    }
    log.trace(`${this.constructor.name}.readTimestamp() failed`)
    return null
  }

  /**
   * @summary Remove the file used as timestamp
   *
   * @returns {undefined} Nothing.
   *
   * @description
   * The main reason this is a separate function is testability.
   */
  async clearTimestamp () {
    const log = this.log
    log.trace(`${this.constructor.name}.clearTimestamp()`)

    await del(this.timestampFileAbsolutePath, { force: true })
  }

  async createTimestamp () {
    const log = this.log
    log.trace(`${this.constructor.name}.createTimestamp()`)

    // Ensure the parent folder is present.
    await makeDir(path.dirname(this.timestampFileAbsolutePath))

    // Create an empty file; the content is ignored,
    // only the modified date is of interest.
    const fd = await fsPromises.open(this.timestampFileAbsolutePath, 'w')
    await fd.close()
  }
}

// ----------------------------------------------------------------------------
// Node.js specific export definitions.

// By default, `module.exports = {}`.
// The class is added as a property to this object.

module.exports.UpdateChecker = UpdateChecker

// In ES6, it would be:
// export class UpdateChecker { ... }
// ...
// import { UpdateChecker } from 'update-checker.js'

// ----------------------------------------------------------------------------
