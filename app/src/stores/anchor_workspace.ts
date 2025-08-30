import ChatIDL from "@/anchor/chat_idl.json";
import { type Chat } from "@/anchor/chat.idl.ts";
import { getConversationListAccount, getWalletAccount } from "@/lib/solana";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { useAnchorWallet, useWallet, type AnchorWallet } from "solana-wallets-vue";
import { toast } from "vue-sonner";
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
    const walletStore = useWallet();
    const wallet = ref<AnchorWallet | undefined>(undefined);
    const connection: Ref<Connection | undefined> = ref(undefined);
    const provider: Ref<AnchorProvider | undefined> = ref(undefined);
    const program: Ref<Program<Chat> | undefined> = ref(undefined);
    const walletConnectionState = ref<WalletConnectionState>(WalletConnectionState.Disconnected);
    const ready = ref(false);

    // watch(
    //     // ! DEBUG ONLY
    //     () => walletConnectionState.value,
    //     (newState, oldState) => {
    //         console.log(
    //             `Wallet connection state changed: ${WalletConnectionState[oldState]} -> ${WalletConnectionState[newState]}`
    //         );
    //     }
    // );

    // watch(
    //     // ! DEBUG ONLY
    //     () => ready.value,
    //     (newReady) => {
    //         console.log(`${newReady ? "RDY" : "NOT RDY"}`);
    //     }
    // );

    watch(
        [walletStore.disconnecting, walletStore.connecting, walletStore.connected, walletStore.ready],
        (
            [newDisconnecting, newConnecting, newConnected, newReady],
            [oldDisconnecting, oldConnecting, oldConnected, oldReady]
        ) => {
            if (walletStore.readyState.value.toString() === "Unsupported") {
                walletConnectionState.value = WalletConnectionState.Disconnected;
                ready.value = true;
                return;
            }
            // else: walletStore.readyState is 'Installed'

            const disconnectingChanged = newDisconnecting !== oldDisconnecting;
            const connectingChanged = newConnecting !== oldConnecting;
            const connectedChanged = newConnected !== oldConnected;
            const readyChanged = newReady !== oldReady;

            if (connectingChanged && newConnecting) {
                walletConnectionState.value = WalletConnectionState.Connecting;
                ready.value = false;
                setTimeout(() => {
                    if (isConnecting() && ready.value === false) {
                        toast.error("Connection with wallet timed out.");
                        walletConnectionState.value = WalletConnectionState.Disconnected;
                        walletStore.disconnect();
                        ready.value = true;
                    }
                }, 20000);
                // return; // ! commenting this might break connection state resolution
            }
            if ((connectedChanged || (connectingChanged && !newConnecting)) && newConnected) {
                // if: connected and (connecting: true -> false) OR
                // if: connected and (connected: false -> true)
                walletConnectionState.value = WalletConnectionState.Connected;

                wallet.value = useAnchorWallet().value;
                provider.value = new AnchorProvider(connection.value!, wallet.value!, {
                    preflightCommitment,
                    commitment,
                });
                program.value = new Program<Chat>(ChatIDL as Chat, provider.value);
                updateConnectionStateIfPresent();
                return;
            }
            if (readyChanged && newReady) {
                if (isDisconnected()) {
                    setTimeout(() => {
                        if (isDisconnected()) {
                            // ! requires auto-connect to work correctly
                            toast.error("Connection with wallet timed out.");
                            walletConnectionState.value = WalletConnectionState.Disconnected;
                            walletStore.disconnect();
                            ready.value = true;
                        }
                    }, 5000);
                }
            }
        }
    );

    function initialize() {
        connection.value = new Connection(apiUrl, commitment);

        if (walletStore.readyState.value.toString() === "Unsupported") {
            setReadyWithDelay();
        } else {
            setTimeout(() => {
                if (isDisconnected() && ready.value === false) {
                    setReadyWithDelay();
                }
            }, 1000);
        }
    }

    function updateConnectionStateIfPresent(): void {
        // Assuming the wallet is connected
        const accountInfo = getWalletAccount(walletStore.publicKey.value!);
        accountInfo
            .then((info) => {
                if (info) {
                    // If the account exists on Solana ledger, the user is present
                    walletConnectionState.value = WalletConnectionState.Present;
                    updateConnectionStateIfRegistered();
                } else {
                    setReadyWithDelay();
                }
            })
            .catch((error) => {
                console.error("Error checking presence on Solana ledger:", error);
                setReadyWithDelay();
            });
    }

    function updateConnectionStateIfRegistered(): void {
        // Assuming the wallet is connected
        const conversationListInfo = getConversationListAccount(walletStore.publicKey.value!);
        conversationListInfo
            .then((info) => {
                if (info) {
                    // If the account exists, the user is registered
                    walletConnectionState.value = WalletConnectionState.Registered;
                }
            })
            .catch((error) => {
                console.error("Error checking registration:", error);
            })
            .finally(() => {
                setReadyWithDelay();
            });
    }

    function setReadyWithDelay(): void {
        setTimeout(() => {
            ready.value = true;
        }, 1000);
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
        wallet: wallet,
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
