<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useWorkspace } from "@/anchor/workspace";
import { PublicKey } from "@solana/web3.js";

const workspace = useWorkspace();
const conversationIds = ref<string[] | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function fetchConversationList() {
    if (!workspace.wallet.value?.publicKey) {
        conversationIds.value = null;
        return;
    }
    loading.value = true;
    error.value = null;
    try {
        // Derive the PDA for the conversation_list_account
        const [conversationListPDA] = PublicKey.findProgramAddressSync(
            [workspace.wallet.value.publicKey.toBuffer(), Buffer.from("chats")],
            workspace.program.value.programId,
        );
        // Fetch the account
        const acc = await workspace.program.value.account.conversationListAccount.fetch(conversationListPDA);
        conversationIds.value = acc.conversationIds;
    } catch (e) {
        error.value = (e as Error)?.message || String(e);
        conversationIds.value = null;
    } finally {
        loading.value = false;
    }
}

watchEffect(() => {
    fetchConversationList();
});
</script>

<template>
    <div class="conversation-list">
        <h3>Conversations</h3>
        <div v-if="loading">Loading...</div>
        <!-- <div v-else-if="error">Error: {{ error }}</div> -->
        <div v-else-if="error || (conversationIds && conversationIds.length === 0)">
            No conversations found.
            <br />
            <RouterLink to="/newconversation">Create new conversation</RouterLink>
        </div>
        <ul v-else-if="conversationIds">
            <li v-for="id in conversationIds" :key="id">
                {{ id }}
            </li>
        </ul>
        <div v-else>Wallet not connected.</div>
    </div>
</template>

<style scoped>
ul {
    list-style: none;
    padding: 0;
}
li {
    padding: 0.25rem 0;
    border-bottom: 1px solid #444;
}
</style>
