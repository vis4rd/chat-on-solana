<script setup lang="ts">
import Button from "@/components/Button.vue";
import { PublicKey } from "@solana/web3.js";
import { computed, ref, watch } from "vue";
import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";

const workspace = useAnchorWorkspaceStore();

const hasSolanaAccount = ref<boolean>(false);
const hasConversationListAccount = ref<boolean>(false);
const walletExists = computed((): boolean => hasSolanaAccount.value && !hasConversationListAccount.value);
const walletRegistered = computed((): boolean => hasSolanaAccount.value && hasConversationListAccount.value);

async function checkWalletAccounts() {
    if (workspace.walletConnectionState !== WalletConnectionState.Connected) {
        hasSolanaAccount.value = false;
        hasConversationListAccount.value = false;
        return;
    }

    const publicKey = workspace.wallet!.publicKey;
    const [conversationListPDA] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), Buffer.from("chats")],
        workspace.program!.programId,
    );
    console.log("Conversation List PDA:", conversationListPDA.toBase58());
    const accountInfo = await workspace.connection!.getAccountInfo(publicKey);
    const conversationListInfo = await workspace.connection!.getAccountInfo(conversationListPDA);
    console.log("COnversation List Account Info:", conversationListInfo);
    hasSolanaAccount.value = !!accountInfo;
    hasConversationListAccount.value = conversationListInfo !== null;
}

// Optionally, watch wallet changes and check automatically
watch(
    () => workspace.walletConnectionState,
    () => {
        checkWalletAccounts();
    },
    { immediate: true },
);

async function createConversationListAccount() {
    if (workspace.walletConnectionState !== WalletConnectionState.Connected) {
        return;
    }

    try {
        const publicKey = workspace.wallet!.publicKey;
        await workspace
            .program!.methods.createConversationList()
            .accounts({
                user: publicKey,
            })
            .rpc();
        await checkWalletAccounts(); // Refresh state
    } catch (e) {
        console.error(e);
    }
}
</script>

<template>
    <div>
        <div v-if="walletExists">
            Looks like your Wallet is present on Solana ledger! Please register a Chat account using button below.
            <Button @click="createConversationListAccount()">Register now!</Button>
        </div>
        <div v-else-if="walletRegistered">Content</div>
        <div v-else>Wallet not connected. Please connect your Wallet in order to use the Chat.</div>
    </div>
</template>
