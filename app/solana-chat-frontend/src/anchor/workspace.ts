import { computed, type ComputedRef, type Ref } from "vue";
import { useAnchorWallet, type AnchorWallet } from "solana-wallets-vue";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { type Chat } from "@/anchor/chat.idl";
import ChatIDL from "@/anchor/chat_idl.json";

const preflightCommitment = "processed";
const commitment = "confirmed";
// const programID = new PublicKey(Chat.address);
// const apiUrl = "http://localhost";
const apiUrl = clusterApiUrl("devnet");

export interface Workspace {
    wallet: Ref<AnchorWallet | undefined>;
    connection: Connection;
    provider: ComputedRef<AnchorProvider>;
    program: ComputedRef<Program<Chat>>;
}

var workspace: Workspace | null = null;
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
    const program = computed(() => new Program<Chat>(ChatIDL as Chat, provider.value));

    workspace = {
        wallet,
        connection,
        provider,
        program,
    };
};
