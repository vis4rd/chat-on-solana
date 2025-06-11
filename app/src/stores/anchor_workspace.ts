import ChatIDL from "@/anchor/chat_idl.json";
import { type Chat } from "@/anchor/chat.idl.ts";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { useAnchorWallet, type AnchorWallet } from "solana-wallets-vue";
import { defineStore } from "pinia";
import { ref, watch, type Ref } from "vue";

const preflightCommitment = "processed";
const commitment = "confirmed";
const apiUrl = clusterApiUrl("devnet");

export enum WalletConnectionState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2,
    Error = 3,
}

interface AnchorWorkspaceStore {
    wallet: Ref<AnchorWallet | undefined>;
    walletConnectionState: Ref<WalletConnectionState>;
    connection: Ref<Connection | undefined>;
    provider: Ref<AnchorProvider | undefined>;
    program: Ref<Program<Chat> | undefined>;
    initialize: () => void;
}

export const useAnchorWorkspaceStore = defineStore("anchor_workspace", (): AnchorWorkspaceStore => {
    const wallet: Ref<AnchorWallet | undefined> = useAnchorWallet();
    const connection: Ref<Connection | undefined> = ref(undefined);
    const provider: Ref<AnchorProvider | undefined> = ref(undefined);
    const program: Ref<Program<Chat> | undefined> = ref(undefined);
    const walletConnectionState = ref<WalletConnectionState>(WalletConnectionState.Connecting);

    watch(
        // TODO: DEBUG, please remove
        () => walletConnectionState.value,
        (newState, oldState) => {
            console.log(
                `Wallet connection state ${WalletConnectionState[oldState]} -> ${WalletConnectionState[newState]}`,
            );
        },
    );

    function initialize() {
        connection.value = new Connection(apiUrl, commitment);

        // Re-initialize provider/program if wallet changes
        watch(
            () => wallet.value,
            (newWallet /*, oldWallet*/) => {
                if (newWallet && connection.value) {
                    // Wallet selected by the user OR
                    // Wallet already selected when loading site
                    provider.value = new AnchorProvider(connection.value, newWallet, {
                        preflightCommitment,
                        commitment,
                    });
                    program.value = new Program<Chat>(ChatIDL as Chat, provider.value);
                    walletConnectionState.value = WalletConnectionState.Connected;
                } else {
                    // Connection dropped OR
                    // Wallet disconnected by the user OR
                    // Wallet not selected when loading site
                    provider.value = undefined;
                    program.value = undefined;
                    walletConnectionState.value = WalletConnectionState.Disconnected;
                }
            },
            { immediate: true },
        );
    }

    return {
        wallet,
        walletConnectionState,
        connection,
        provider,
        program,
        initialize,
    };
});
