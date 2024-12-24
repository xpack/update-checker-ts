import { UpdateChecker } from '../../src/index.js';
export class PublicUpdateChecker extends UpdateChecker {
    getLog() {
        return this.log;
    }
    getPackageName() {
        return this.packageName;
    }
    getPackageVersion() {
        return this.packageVersion;
    }
    getTimestampsFolderPath() {
        return this.timestampsFolderPath;
    }
    getCheckUpdatesIntervalMilliseconds() {
        return this.checkUpdatesIntervalMilliseconds;
    }
    setCheckUpdatesIntervalMilliseconds(milliseconds) {
        this.checkUpdatesIntervalMilliseconds = milliseconds;
    }
    getLatestVersionPromise() {
        return this.latestVersionPromise;
    }
    async clearTimestamp() {
        await super.clearTimestamp();
    }
    async readTimestampFileStats() {
        return await super.readTimestampFileStats();
    }
}
//# sourceMappingURL=public-update-checker.js.map