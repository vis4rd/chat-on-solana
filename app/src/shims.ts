// fix for "buffer not defined" from: https://github.com/solana-foundation/anchor/issues/986
// also in index.html

import { Buffer } from "buffer";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.Buffer = Buffer;
