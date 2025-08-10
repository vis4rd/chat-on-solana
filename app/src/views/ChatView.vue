<script setup lang="ts">
    import BlockWrapper from "@/components/BlockWrapper.vue";
    import ConversationList from "@/components/ConversationList.vue";
    import { useConversationListStore } from "@/stores/conversation_list";

    const conversationListStore = useConversationListStore();
</script>

<template>
    <div class="chat-view">
        <ConversationList />
        <BlockWrapper class="full-height">
            Chat

            <span>Selected: '{{ conversationListStore.conversation_id }}'</span>
            <span>Index: '{{ conversationListStore.conversation_index }}'</span>
            <span>PDA: '{{ conversationListStore.conversation_account_pda }}'</span>
        </BlockWrapper>
    </div>
</template>

<style scoped>
    .chat-view {
        margin-block: 1rem;

        display: flex;
        flex-direction: row;
        gap: 1rem;
    }

    .full-height {
        margin-block: 0;
        display: flex;
        flex-grow: 1;
    }
</style>
