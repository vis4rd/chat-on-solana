<script setup lang="ts">
    import BlockWrapper from "@/components/BlockWrapper.vue";
    import ChatMessage from "@/components/ChatMessage.vue";
    import ChatWindow from "@/components/ChatWindow.vue";
    import ConversationList from "@/components/ConversationList.vue";
    import { useConversationListStore } from "@/stores/conversation_list";

    const conversationListStore = useConversationListStore();
</script>

<template>
    <div class="chat-view">
        <ConversationList class="list" />
        <BlockWrapper class="chat-window-block">
            <!-- TODO: conversation name -->
            <!-- TODO: number of chatters -->
            Chat

            <span>Selected: '{{ conversationListStore.selectedChat?.id }}'</span>
            <span>Index: '{{ conversationListStore.selectedChat?.index }}'</span>
            <span>PDA: '{{ conversationListStore.selectedChat?.pda }}'</span>

            <ChatWindow>
                <ChatMessage user>hello</ChatMessage>
                <ChatMessage>hi there!</ChatMessage>
            </ChatWindow>
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

    .list {
        min-width: 200px;
        flex: 0 0 30%;
    }

    .chat-window-block {
        display: flex;
        margin-block: 0;
        flex: 1;
    }
</style>
