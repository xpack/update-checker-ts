import { Logger } from '@xpack/logger';
export class MockLogger extends Logger {
    get lines() {
        return this.console.lines;
    }
    clear() {
        this.console.clear();
    }
}
//# sourceMappingURL=mock-logger.js.map