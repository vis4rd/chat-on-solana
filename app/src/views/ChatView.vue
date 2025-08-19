<script setup lang="ts">
    import ChatWindow from "@/components/ChatWindow.vue";
    import ConversationList from "@/components/ConversationList.vue";
</script>

<template>
    <div class="chat-view">
        <ConversationList class="list" />
        <ChatWindow />
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
</style>
