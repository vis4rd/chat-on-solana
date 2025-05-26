import { computed, type ComputedRef, type Ref } from "vue";
import { useAnchorWallet, type AnchorWallet } from "solana-wallets-vue";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import * as IDL from "./chat.idl";

const preflightCommitment = "processed";
const commitment = "confirmed";
// const programID = new PublicKey(IDL.Chat.address);
const apiUrl = "localhost";
// const apiUrl = clusterApiUrl("devnet");

var workspace: any | null = null;
export const useWorkspace = () => workspace;

export const initWorkspace = () => {
    const wallet = useAnchorWallet();
    const connection = new Connection(apiUrl, commitment);
    const provider = computed(
        () =>
            new AnchorProvider(connection, (wallet as Ref<AnchorWallet>).value, {
                preflightCommitment,
                commitment,
            }),
    );
    const program = computed(() => new Program(IDL.Chat));

    workspace = {
        wallet,
        connection,
        provider,
        program,
    };
};
