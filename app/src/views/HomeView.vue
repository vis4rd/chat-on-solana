<script setup lang="ts">
import BlockWrapper from "@/components/BlockWrapper.vue";
import ConversationList from "@/components/ConversationList.vue";
import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";

const workspace = useAnchorWorkspaceStore();
</script>

<template>
    <div class="horizontal-layout">
        <ConversationList class="sidebar" />

        <BlockWrapper class="chat">
            <div v-if="workspace.isDisconnected()">
                Wallet not connected. Please connect your Wallet in order to use the Chat.
            </div>
            <div v-else-if="workspace.isConnected()">
                We have detected that your wallet does not have an account on Solana ledger just yet :). You can create
                it by obtaining some SOL.
            </div>
            <!-- isPresent() -> handled by /register view -->
            <div v-else-if="workspace.isRegistered()">Content</div>
            <div v-else>Unknown Wallet state...</div>
        </BlockWrapper>
    </div>
</template>

<style scoped>
.horizontal-layout {
    display: flex;
    width: 100%;
    gap: 1rem;
}

.sidebar {
    min-width: max(20%, 280px);
    max-width: 20%;
    text-align: center;
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.chat {
    width: 100%;
    margin-left: 0;
}
</style>
