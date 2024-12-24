import { Console } from 'node:console';
import { Writable } from 'node:stream';
export class MockConsole extends Console {
    constructor() {
        const stdoutStream = new Writable({
            write: (chunk, _encoding, callback) => {
                this.lines.push(chunk.toString());
                callback();
            }
        });
        super(stdoutStream);
        this.lines = [];
    }
    clear() {
        super.clear();
        this.lines = [];
    }
}
//# sourceMappingURL=mock-console.js.map