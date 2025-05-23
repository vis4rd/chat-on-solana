import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";

export function handleAnchorError(_error: any): anchor.AnchorError {
    if (_error instanceof anchor.AnchorError) {
        const error: anchor.AnchorError = _error;
        // Logging.logAnchorError(error);
        // Logging.logProgramLogs(error);

        return error;
    }

    assert.ok(_error instanceof anchor.AnchorError, `Expected an AnchorError but got something else: ${_error}`);
}
