<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";
import { useConversationListStore } from "@/stores/conversation_list";
import { PublicKey } from "@solana/web3.js";
import { ref, watchEffect } from "vue";

const conversationListStore = useConversationListStore();
const workspace = useAnchorWorkspaceStore();

const loading = ref(false);
const error = ref<string | null>(null);

async function fetchConversationList() {
    // TODO: move to conversation_list store
    if (workspace.walletConnectionState !== WalletConnectionState.Connected) {
        conversationListStore.conversations = [];
        return;
    }

    loading.value = true;
    error.value = null;
    try {
        // Derive the PDA for the conversation_list_account
        const [conversationListPDA] = PublicKey.findProgramAddressSync(
            [workspace.wallet!.publicKey.toBuffer(), Buffer.from("chats")],
            workspace.program!.programId,
        );
        // Fetch the account
        const acc = await workspace.program!.account.conversationListAccount.fetch(conversationListPDA);
        conversationListStore.conversations = acc.conversationIds;
    } catch (e) {
        error.value = (e as Error)?.message || String(e);
        conversationListStore.conversations = [];
    } finally {
        loading.value = false;
    }
}

watchEffect(() => {
    fetchConversationList();
});
</script>

<template>
    <!-- TODO:
            if wallet not selected: Display "Please connect with your wallet."
            if wallet connecting:   Display "Connecting to your wallet."
            if wallet connected but not on blockchain: Display "It seems your wallet does not have an account on Solana."
            if wallet connected but not registered in app: Display "Wallet not registered"
            if wallet registered: Display list of conversations -->
    <Card>
        <CardHeader>
            <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
            <div v-if="loading">Loading...</div>
            <!-- <div v-else-if="error">Error: {{ error }}</div> -->
            <div
                v-else-if="
                    error || (conversationListStore.conversations && conversationListStore.conversations.length === 0)
                "
            >
                No conversations found.
                <br />
                Create your first chat using button below!
                <br />
                <br />

                <RouterLink to="/newconversation">
                    <Button>Create a new conversation</Button>
                </RouterLink>
            </div>
            <ul v-else-if="conversationListStore.conversations">
                <li v-for="id in conversationListStore.conversations" :key="id">
                    {{ id }}
                </li>
            </ul>
            <div v-else>Wallet not connected.</div>
        </CardContent>
        <!-- <CardFooter> Card Footer </CardFooter> -->
    </Card>
</template>

<style scoped>
ul {
    padding: 0;
    margin: 0;
}

li {
    padding: 0.25rem 0;
    text-overflow: ellipsis;
    overflow-x: hidden;
}
</style>
