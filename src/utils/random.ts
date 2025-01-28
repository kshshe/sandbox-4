const buffer: number[] = [];
const MAX_BUFFER_SIZE = 1_000_000;

setInterval(() => {
    if (buffer.length < MAX_BUFFER_SIZE) {
        for (let i = 0; i < 10_000; i++) {
            buffer.push(Math.random());
        }
    }
}, 0);

let fromRandomCount = 0;
let fromBufferCount = 0;

export function random() {
    const fromBuffer = buffer.pop();
    if (!fromBuffer) {
        fromRandomCount++;
        return Math.random();
    }
    fromBufferCount++;
    return fromBuffer;
}