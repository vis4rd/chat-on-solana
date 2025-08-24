<script setup lang="ts">
    import ChatMessage from "@/components/ChatMessage.vue";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { PublicKey } from "@solana/web3.js";
    import { useVModel } from "@vueuse/core";
    import { toast } from "vue-sonner";
    import { onUnmounted } from "vue";

    type ChatMessage = { data: string; author: PublicKey; timestamp: number };
    type ConversationAccount = {
        authority: PublicKey;
        chatterCount: number;
        chatters: PublicKey[];
        messages: ChatMessage[];
    };

    const workspace = useAnchorWorkspaceStore();
    const conversationDefault: ConversationAccount = {
        authority: PublicKey.default,
        chatterCount: 0,
        chatters: [],
        messages: [],
    };

    const props = defineProps<{ modelValue: ConversationAccount; accountPda: PublicKey | undefined }>();
    const emits = defineEmits<{ (e: "update:modelValue", payload: ConversationAccount): void }>();
    const conversation = useVModel(props, "modelValue", emits, { passive: true, defaultValue: conversationDefault });

    async function fetchConversationHistory() {
        try {
            // Wait until props.accountPda is available before proceeding
            while (!props.accountPda) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            conversation.value = await workspace.program!.account.conversationAccount.fetch(props.accountPda)!;
        } catch (error) {
            toast.error("Can't load chat history:", { description: (error as Error).message });
            conversation.value = conversationDefault;
        }
    }

    await fetchConversationHistory();

    const eventEmitter = workspace.program!.account.conversationAccount.subscribe(props.accountPda!);
    eventEmitter.on("change", (updatedConversation: ConversationAccount) => {
        console.debug("Conversation updated:", updatedConversation);
        conversation.value = updatedConversation;
    });

    onUnmounted(() => {
        eventEmitter.removeAllListeners();
        workspace.program!.account.conversationAccount.unsubscribe(props.accountPda!);
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
