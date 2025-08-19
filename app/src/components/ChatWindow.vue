<script setup lang="ts">
    import BlockWrapper from "@/components/BlockWrapper.vue";
    import ChatMessage from "@/components/ChatMessage.vue";
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { useConversationListStore } from "@/stores/conversation_list";
    import { Icon } from "@iconify/vue";
    import { computed, ref } from "vue";

    const conversationListStore = useConversationListStore();

    const input = ref("");
    const inputLength = computed(() => input.value.trim().length);

    function isMessageValid() {
        return inputLength.value > 0 && inputLength.value <= 100;
    }
    function sendMessage() {
        if (isMessageValid()) {
            // TODO
            input.value = "";
        }
    }
</script>

<template>
    <div class="column">
        <BlockWrapper class="chat-window">
            <!-- TODO: conversation name -->
            <!-- TODO: number of chatters -->
            Chat

            <span>Selected: '{{ conversationListStore.selectedChat?.id }}'</span>
            <span>Index: '{{ conversationListStore.selectedChat?.index }}'</span>
            <span>PDA: '{{ conversationListStore.selectedChat?.pda }}'</span>

            <ChatMessage user>hello</ChatMessage>
            <ChatMessage>hi there!</ChatMessage>
        </BlockWrapper>

        <div class="message-input">
            <form class="flex w-full items-center space-x-2" @submit.prevent="sendMessage()">
                <Input v-model="input" placeholder="Type a message..." />
                <ElementWrapper class="character-count">{{ 100 - inputLength }}</ElementWrapper>
                <Button variant="default" size="icon" aria-label="Send the message" :disabled="!isMessageValid()">
                    <Icon icon="fluent:send-24-regular" class="size-5"></Icon>
                </Button>
            </form>
        </div>
    </div>
</template>

<style scoped>
    .column {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 1rem;
    }
    .chat-window {
        display: flex;
        flex-direction: column;
        margin-block: 0;
        width: 100%;
    }
    .message-input {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        align-items: center;
    }
    .character-count {
        color: v-bind('(100 - inputLength) < 20 ? "var(--color-destructive)" : "var(--color-foreground)"');
    }
</style>
