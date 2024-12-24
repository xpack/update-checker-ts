import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deleteAsync } from 'del';
import isCI from 'is-ci';
import isInstalledGlobally from 'is-installed-globally';
import isPathInside from 'is-path-inside';
import { makeDirectory } from 'make-dir';
import latestVersionPromise from 'latest-version';
import * as semver from 'semver';
const timestampsFolderPath = path.join(os.homedir(), '.config', 'timestamps');
const timestampSuffix = '-update-check';
const defaultCheckUpdatesIntervalSeconds = 24 * 60 * 60;
export class UpdateChecker {
    constructor(params) {
        this.latestVersion = undefined;
        this.returnedError = undefined;
        this.latestVersionPromise = undefined;
        this.isCI = false;
        this.isTTY = false;
        this.isRunningAsRoot = false;
        this.isInstalledGlobally = false;
        this.isInstalledAsRoot = false;
        assert(params);
        assert(params.log);
        this.log = params.log;
        const { log } = this;
        log.trace(`${this.constructor.name}.constructor()`);
        assert(params.packageName);
        this.packageName = params.packageName;
        assert(params.packageVersion);
        this.packageVersion = params.packageVersion;
        const defaultEnvVariableName = `NO_${this.packageName}_UPDATE_NOTIFIER`.toUpperCase()
            .replace(/[^A-Z0-9]/g, '_').replace(/__*/g, '_');
        this.envVariableName = params.envVariableName ?? defaultEnvVariableName;
        this.timestampsFolderPath = params.timestampsFolderPath ??
            timestampsFolderPath;
        this.timestampFilePath = path.join(this.timestampsFolderPath, this.packageName + timestampSuffix);
        this.checkUpdatesIntervalMilliseconds =
            (params.checkUpdatesIntervalSeconds ??
                defaultCheckUpdatesIntervalSeconds) * 1000;
        this.processEnv = UpdateChecker.testEnvironment?.env ?? process.env ?? {};
        if (UpdateChecker.testEnvironment?.isCI !== undefined) {
            this.isCI = UpdateChecker.testEnvironment?.isCI;
        }
        else {
            this.isCI = isCI;
        }
        if (UpdateChecker.testEnvironment?.isTTY !== undefined) {
            this.isTTY = UpdateChecker.testEnvironment.isTTY;
        }
        else {
            this.isTTY = process.stdout.isTTY;
        }
        if (UpdateChecker.testEnvironment?.isRunningAsRoot !== undefined) {
            this.isRunningAsRoot = UpdateChecker.testEnvironment.isRunningAsRoot;
        }
        else {
            if (os.platform() !== 'win32') {
                this.isRunningAsRoot =
                    process?.geteuid !== undefined &&
                        process?.getuid !== undefined &&
                        process.geteuid() !== process.getuid();
            }
            else {
                this.isRunningAsRoot = false;
            }
        }
        if (UpdateChecker.testEnvironment?.isInstalledGlobally !== undefined) {
            this.isInstalledGlobally =
                UpdateChecker.testEnvironment.isInstalledGlobally;
        }
        else {
            this.isInstalledGlobally = isInstalledGlobally;
        }
        if (UpdateChecker.testEnvironment?.isInstalledAsRoot !== undefined) {
            this.isInstalledAsRoot = UpdateChecker.testEnvironment.isInstalledAsRoot;
        }
        else {
            this.isInstalledAsRoot = false;
            if (os.platform() !== 'win32') {
                const dirname = path.dirname(fileURLToPath(import.meta.url));
                if (this.isInstalledGlobally &&
                    isPathInside(dirname, '/usr/local')) {
                    this.isInstalledAsRoot = false;
                }
            }
        }
    }
    async initiateVersionRetrieval() {
        const { log } = this;
        log.trace(`${this.constructor.name}.initiateVersionRetrieval()`);
        this.latestVersionPromise = undefined;
        if (this.checkUpdatesIntervalMilliseconds === 0 ||
            this.isCI ||
            !this.isTTY ||
            this.processEnv[this.envVariableName] !== undefined) {
            log.trace(`${this.constructor.name}:` +
                ' do not fetch latest version number.');
            return;
        }
        if (await this.didIntervalExpire(this.checkUpdatesIntervalMilliseconds)) {
            log.trace(`${this.constructor.name}:` +
                ' fetching latest version number...');
            this.latestVersionPromise = latestVersionPromise(this.packageName);
        }
    }
    async notifyIfUpdateIsAvailable() {
        const { log } = this;
        log.trace(`${this.constructor.name}.notifyIfUpdateIsAvailable()`);
        if (this.latestVersionPromise == null) {
            log.trace(`${this.constructor.name}:` +
                ' latestVersionPromise not defined, update silently ignored.');
            return;
        }
        let latestVersion;
        try {
            latestVersion = await this.latestVersionPromise;
            log.trace(`${this.constructor.name}:` +
                ` latest ${this.packageName}${latestVersion}`);
            this.latestVersionPromise = undefined;
            this.latestVersion = latestVersion;
            if (semver.gt(latestVersion, this.packageVersion)) {
                this.sendNotification();
            }
            if (this.isRunningAsRoot) {
                if (os.platform() !== 'win32' &&
                    process?.geteuid !== undefined &&
                    process?.getuid !== undefined) {
                    log.trace(`${this.constructor.name}:` +
                        ` geteuid() ${process.geteuid()} != ${process.getuid()}`);
                }
                else {
                    log.trace(`${this.constructor.name}: running as administrator`);
                }
                return;
            }
        }
        catch (err) {
            if (log.isDebug) {
                log.debug(err);
            }
            else {
                log.warn(err.message);
            }
            this.returnedError = err;
        }
        try {
            await this.clearTimestamp();
            await this.createTimestamp();
            log.debug(`${this.constructor.name}.checkUpdate()` +
                ` timestamp ${this.timestampFilePath} created`);
        }
        catch (err) {
            log.debug(err);
        }
    }
    sendNotification() {
        const { log } = this;
        log.trace(`${this.constructor.name}.sendNotification()`);
        const isGlobalStr = this.isInstalledGlobally ? ' --global' : '';
        assert(this.latestVersion);
        let message = '\n';
        message += `>>> New version ${this.packageVersion} -> `;
        message += `${this.latestVersion} available. <<<\n`;
        message += ">>> Run '";
        if (this.isInstalledAsRoot) {
            message += 'sudo ';
        }
        message += `npm install${isGlobalStr} ${this.packageName}' to update. <<<`;
        log.info(message);
    }
    async didIntervalExpire(ageMilliseconds) {
        assert(ageMilliseconds > 0);
        const { log } = this;
        const stats = await this.readTimestampFileStats();
        if (stats != null) {
            const deltaMillis = Date.now() - stats.mtime.valueOf();
            if (deltaMillis < ageMilliseconds) {
                log.trace(`${this.constructor.name}: update timeout did not expire ` +
                    `${Math.floor(deltaMillis / 1000)} ` +
                    `< ${Math.floor(ageMilliseconds / 1000)}`);
                return false;
            }
        }
        else {
            log.trace(`${this.constructor.name}:` +
                ' there is no previous update timestamp.');
        }
        return true;
    }
    async readTimestampFileStats() {
        const { log } = this;
        try {
            const stats = await fs.promises.stat(this.timestampFilePath);
            log.trace(`${this.constructor.name}.readTimestamp() ok`);
            return stats;
        }
        catch (err) {
        }
        log.trace(`${this.constructor.name}.readTimestamp() failed`);
        return null;
    }
    async clearTimestamp() {
        const { log } = this;
        log.trace(`${this.constructor.name}.clearTimestamp()`);
        await deleteAsync(this.timestampFilePath, { force: true });
    }
    async createTimestamp() {
        const { log } = this;
        log.trace(`${this.constructor.name}.createTimestamp()`);
        await makeDirectory(path.dirname(this.timestampFilePath));
        const fd = await fs.promises.open(this.timestampFilePath, 'w');
        await fd.close();
    }
}
//# sourceMappingURL=update-checker.js.map