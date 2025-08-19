<script setup lang="ts">
    import ChatMessage from "@/components/ChatMessage.vue";
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
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            const fetchedConversation = await workspace.program!.account.conversationAccount.fetch(props.accountPda);
            conversation.value = fetchedConversation;
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
    <ChatMessage
        v-for="message in conversation.messages"
        :key="message.timestamp"
        :user="message.author.equals(workspace.wallet!.publicKey)"
        >{{ message.data }}</ChatMessage
    >
</template>

<style scoped></style>
