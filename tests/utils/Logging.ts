import { getLogs } from "@solana-developers/helpers";
import * as anchor from "@coral-xyz/anchor";

export default class Logging {
    static logAnchorError(error: anchor.AnchorError): void {
        console.log(
            `Error ${error.error.errorCode.number} (${error.error.errorCode.code}): ${error.error.errorMessage}`
        );
    }

    static logProgramLogs(provider: anchor.AnchorProvider, tx: anchor.web3.TransactionSignature): void;
    static logProgramLogs(error: anchor.AnchorError): void;
    static logProgramLogs(
        tt: anchor.AnchorError | anchor.AnchorProvider,
        _tx?: anchor.web3.TransactionSignature
    ): void {
        const func = async () => {
            if (tt instanceof anchor.AnchorProvider && _tx) {
                const provider = tt;
                const tx = _tx as anchor.web3.TransactionSignature;
                const logs = await getLogs(provider.connection, tx);
                console.log("Program logs: ", logs);
            } else if (tt instanceof anchor.AnchorError) {
                const error = tt;
                console.log("Program logs: ", error.logs);
            } else {
                throw new Error("Invalid argument");
            }
        };
        func();
    }
}
