<script setup lang="ts">
import Button from "@/components/Button.vue";
import { PublicKey } from "@solana/web3.js";
import { computed, ref, watch } from "vue";
import { useWorkspace } from "@/anchor/workspace";

const workspace = useWorkspace();

const hasSolanaAccount = ref<boolean>(false);
const hasConversationListAccount = ref<boolean>(false);
const walletExists = computed((): boolean => hasSolanaAccount.value && !hasConversationListAccount.value);
const walletRegistered = computed((): boolean => hasSolanaAccount.value && hasConversationListAccount.value);

async function checkWalletAccounts() {
    const publicKey = workspace.wallet.value?.publicKey;
    if (!publicKey) {
        hasSolanaAccount.value = false;
        hasConversationListAccount.value = false;
        return;
    }

    const [conversationListPDA] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), Buffer.from("chats")],
        workspace.program.value.programId,
    );
    console.log("Conversation List PDA:", conversationListPDA.toBase58());
    const accountInfo = await workspace.connection.getAccountInfo(publicKey);
    const conversationListInfo = await workspace.connection.getAccountInfo(conversationListPDA);
    console.log("COnversation List Account Info:", conversationListInfo);
    hasSolanaAccount.value = !!accountInfo;
    hasConversationListAccount.value = conversationListInfo !== null;
}

// Optionally, watch wallet changes and check automatically
watch(
    () => workspace.wallet.value?.publicKey,
    () => {
        checkWalletAccounts();
    },
    { immediate: true },
);

async function createConversationListAccount() {
    const publicKey = workspace.wallet.value?.publicKey;
    if (!publicKey) {
        return;
    }
    try {
        await workspace.program.value.methods
            .createConversationList()
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
