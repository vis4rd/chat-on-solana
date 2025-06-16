import ChatIDL from "@/anchor/chat_idl.json";
import { type Chat } from "@/anchor/chat.idl.ts";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { useAnchorWallet, type AnchorWallet } from "solana-wallets-vue";
import { defineStore } from "pinia";
import { ref, watch, type Ref } from "vue";

const preflightCommitment = "processed";
const commitment = "confirmed";
const apiUrl = clusterApiUrl("devnet");

export enum WalletConnectionState {
    Disconnected,
    Connecting,
    Connected,
    Registered,
    Error,
}

interface AnchorWorkspaceStore {
    wallet: Ref<AnchorWallet | undefined>;
    walletConnectionState: Ref<WalletConnectionState>;
    connection: Ref<Connection | undefined>;
    provider: Ref<AnchorProvider | undefined>;
    program: Ref<Program<Chat> | undefined>;
    initialize: () => void;
    isDisconnected: () => boolean;
    isConnecting: () => boolean;
    isConnected: () => boolean;
    isRegistered: () => boolean;
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
                    updateConnectionStateIfRegistered();
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

    function updateConnectionStateIfRegistered(): void {
        // Assuming the wallet is connected
        const publicKey = wallet.value!.publicKey;
        const [conversationListPDA] = PublicKey.findProgramAddressSync(
            [publicKey.toBuffer(), Buffer.from("chats")],
            program.value!.programId,
        );
        const conversationListInfo = connection.value!.getAccountInfo(conversationListPDA);
        conversationListInfo
            .then((info) => {
                if (info) {
                    // If the account exists, the user is registered
                    walletConnectionState.value = WalletConnectionState.Registered;
                } else {
                    // Otherwise, leave wallet in conncted state
                    walletConnectionState.value = WalletConnectionState.Connected;
                }
            })
            .catch((error) => {
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

    return {
        // variables
        wallet,
        walletConnectionState,
        connection,
        provider,
        program,
        //functions
        initialize,
        isDisconnected,
        isConnecting,
        isConnected,
        isRegistered,
    };
});
