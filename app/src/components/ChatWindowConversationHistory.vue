<script setup lang="ts">
    import ChatMessage from "@/components/ChatMessage.vue";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import type { PublicKey } from "@solana/web3.js";
    import { useVModel } from "@vueuse/core";

    type ChatMessage = { data: string; author: PublicKey; timestamp: number };
    type ConversationAccount = { chatterCount: number; chatters: PublicKey[]; messages: ChatMessage[] };

    const workspace = useAnchorWorkspaceStore();

    const props = defineProps<{ modelValue: ConversationAccount; accountPda: PublicKey | undefined }>();
    const emits = defineEmits<{ (e: "update:modelValue", payload: ConversationAccount): void }>();
    const conversation = useVModel(props, "modelValue", emits, {
        passive: true,
        defaultValue: { chatterCount: 0, chatters: [], messages: [] },
    });

    async function fetchConversationHistory() {
        try {
            console.log("Fetching conversation history for:", props.accountPda);

            // Wait until props.accountPda is available before proceeding
            while (!props.accountPda) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            conversation.value = await workspace.program!.account.conversationAccount.fetch(props.accountPda)!;
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    }

    await fetchConversationHistory();

    const eventEmitter = workspace.program!.account.conversationAccount.subscribe(props.accountPda!);
    eventEmitter.on("change", (updatedConversation: ConversationAccount) => {
        console.debug("Conversation updated:", updatedConversation);
        conversation.value = updatedConversation;
    });
</script>

<template>
    <ScrollArea class="chat-scroll-area">
        <!-- TODO: timestamps? -->
        <!-- TODO: authors -->
        <ChatMessage
            v-for="message in conversation.messages"
            :key="message.timestamp"
            :user="message.author.equals(workspace.wallet!.publicKey)"
            >{{ message.data }}</ChatMessage
        >
    </ScrollArea>
</template>

<style scoped>
    .chat-scroll-area {
        width: 100%;
        height: 100%;
        padding-left: 0.6rem;
        padding-right: 0.6rem;
    }
</style>
