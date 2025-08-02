import ChatIDL from "@/anchor/chat_idl.json";
import { type Chat } from "@/anchor/chat.idl.ts";
import { getConversationListAccount, getWalletAccount } from "@/lib/solana";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { useAnchorWallet, type AnchorWallet } from "solana-wallets-vue";
import { defineStore } from "pinia";
import { ref, watch, type Ref } from "vue";

const preflightCommitment = "processed";
const commitment = "confirmed";
const apiUrl = clusterApiUrl("devnet");

export enum WalletConnectionState {
    Error,
    Disconnected, // wallet not selected or disconnected
    Connecting, //   wallet selected, but not connected yet
    Connected, //    wallet connected, but not checked if present on solana ledger yet
    Present, //      wallet connected and present on solana ledger
    Registered, //   wallet present and has conversation list account
}

interface AnchorWorkspaceStore {
    wallet: Ref<AnchorWallet | undefined>;
    walletConnectionState: Ref<WalletConnectionState>;
    connection: Ref<Connection | undefined>;
    provider: Ref<AnchorProvider | undefined>;
    program: Ref<Program<Chat> | undefined>;
    ready: Ref<boolean>;
    initialize: () => void;
    isDisconnected: () => boolean;
    isConnecting: () => boolean;
    isConnected: () => boolean;
    isPresent: () => boolean;
    isRegistered: () => boolean;
    isAtLeastConnected: () => boolean;
}

export const useAnchorWorkspaceStore = defineStore("anchor_workspace", (): AnchorWorkspaceStore => {
    const wallet: Ref<AnchorWallet | undefined> = useAnchorWallet();
    const connection: Ref<Connection | undefined> = ref(undefined);
    const provider: Ref<AnchorProvider | undefined> = ref(undefined);
    const program: Ref<Program<Chat> | undefined> = ref(undefined);
    const walletConnectionState = ref<WalletConnectionState>(WalletConnectionState.Connecting);
    const ready = ref(false);

    watch(
        // TODO: DEBUG, please remove
        () => walletConnectionState.value,
        (newState, oldState) => {
            console.log(
                `Wallet connection state changed: ${WalletConnectionState[oldState]} -> ${WalletConnectionState[newState]}`,
            );
        },
    );

    watch(
        () => ready.value,
        (newReady) => {
            console.log(`${newReady ? "RDY" : "NOT RDY"}`);
        },
    );

    function initialize() {
        connection.value = new Connection(apiUrl, commitment);
        ready.value = false;

        // Re-initialize provider/program if wallet changes
        watch(
            () => wallet.value,
            (newWallet /*, oldWallet*/) => {
                ready.value = false;
                if (newWallet && connection.value) {
                    // Wallet selected by the user OR
                    // Wallet already selected when loading site
                    provider.value = new AnchorProvider(connection.value, newWallet, {
                        preflightCommitment,
                        commitment,
                    });
                    program.value = new Program<Chat>(ChatIDL as Chat, provider.value);
                    walletConnectionState.value = WalletConnectionState.Connected;
                    updateConnectionStateIfPresent();
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

    function updateConnectionStateIfPresent(): void {
        // Assuming the wallet is connected
        const accountInfo = getWalletAccount(wallet.value!.publicKey);
        accountInfo
            .then((info) => {
                if (info) {
                    // If the account exists on Solana ledger, the user is present
                    walletConnectionState.value = WalletConnectionState.Present;
                    updateConnectionStateIfRegistered();
                }
            })
            .catch((error) => {
                ready.value = true;
                console.error("Error checking presence on Solana ledger:", error);
            });
    }

    function updateConnectionStateIfRegistered(): void {
        // Assuming the wallet is connected
        const conversationListInfo = getConversationListAccount(wallet.value!.publicKey);
        conversationListInfo
            .then((info) => {
                if (info) {
                    // If the account exists, the user is registered
                    walletConnectionState.value = WalletConnectionState.Registered;
                }
                ready.value = true;
            })
            .catch((error) => {
                ready.value = true;
                console.error("Error checking registration:", error);
            });
    }

    function isDisconnected(): boolean {
        return walletConnectionState.value === WalletConnectionState.Disconnected;
    }

    function isConnecting(): boolean {
        return walletConnectionState.value === WalletConnectionState.Connecting;
    }

    function isConnected(): boolean {
        return walletConnectionState.value === WalletConnectionState.Connected;
    }

    function isRegistered(): boolean {
        return walletConnectionState.value === WalletConnectionState.Registered;
    }

    function isPresent(): boolean {
        return walletConnectionState.value === WalletConnectionState.Present;
    }

    function isAtLeastConnected(): boolean {
        return walletConnectionState.value >= WalletConnectionState.Connected;
    }

    return {
        // variables
        wallet,
        walletConnectionState,
        connection,
        provider,
        program,
        ready,
        //functions
        initialize,
        isDisconnected,
        isConnecting,
        isConnected,
        isPresent,
        isRegistered,
        isAtLeastConnected,
    };
});
