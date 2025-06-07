<script setup lang="ts">
import { PublicKey } from "@solana/web3.js";
import { ref, watchEffect } from "vue";
import { useConversationListStore } from "@/stores/conversation_list";
import { useWorkspace } from "@/anchor/workspace";

const conversationListStore = useConversationListStore();
const workspace = useWorkspace();

const loading = ref(false);
const error = ref<string | null>(null);

async function fetchConversationList() {
    // TODO: move to conversation_list store
    if (!workspace.wallet.value?.publicKey) {
        conversationListStore.conversations = [];
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
    <div class="conversation-list">
        <h3>Conversations</h3>
        <div v-if="loading">Loading...</div>
        <!-- <div v-else-if="error">Error: {{ error }}</div> -->
        <div
            v-else-if="
                error || (conversationListStore.conversations && conversationListStore.conversations.length === 0)
            "
        >
            No conversations found.
            <br />
            <RouterLink to="/newconversation">Create new conversation</RouterLink>
        </div>
        <ul v-else-if="conversationListStore.conversations">
            <li v-for="id in conversationListStore.conversations" :key="id">
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
