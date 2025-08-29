<script setup lang="ts">
    import ChatMessage from "@/components/ChatMessage.vue";
    import ChatMessageAuthor from "@/components/ChatMessageAuthor.vue";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { PublicKey } from "@solana/web3.js";
    import { useVModel } from "@vueuse/core";
    import { toast } from "vue-sonner";
    import { computed, onUnmounted, type ComputedRef, type Ref } from "vue";

    type ChatMessage = { data: string; author: PublicKey; timestamp: number };
    type ConversationAccount = {
        authority: PublicKey;
        chatterCount: number;
        chatters: PublicKey[];
        messages: ChatMessage[];
    };
    type ChatMessageSequence = { author: PublicKey; messages: ChatMessage[] };

    const workspace = useAnchorWorkspaceStore();
    const conversationDefault: ConversationAccount = {
        authority: PublicKey.default,
        chatterCount: 0,
        chatters: [],
        messages: [],
    };

    const props = defineProps<{ modelValue: ConversationAccount; accountPda: PublicKey | undefined }>();
    const emits = defineEmits<{ (e: "update:modelValue", payload: ConversationAccount): void }>();
    const conversation: Ref<ConversationAccount> = useVModel(props, "modelValue", emits, {
        passive: true,
        defaultValue: conversationDefault,
    });
    const messages: ComputedRef<ChatMessage[]> = computed(() => conversation.value.messages);
    const messageSequences: ComputedRef<ChatMessageSequence[]> = computed(() => {
        const sequences: ChatMessageSequence[] = [];
        let currentSequence: ChatMessageSequence | null = null;

        messages.value.forEach((message) => {
            if (!currentSequence || !message.author.equals(currentSequence.author)) {
                if (currentSequence) {
                    sequences.push(currentSequence);
                }
                currentSequence = { author: message.author, messages: [message] };
            } else {
                currentSequence.messages.push(message);
            }
        });

        if (currentSequence) {
            sequences.push(currentSequence);
        }

        return sequences;
    });

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
        <div
            v-for="messageSequence in messageSequences"
            :key="messageSequence.author.toString()"
            class="chat-message-sequence"
        >
            <ChatMessageAuthor :author="messageSequence.author" :conversation="conversation" />
            <div class="chat-message-sequence-messages">
                <ChatMessage
                    v-for="message in messageSequence.messages"
                    :key="message.timestamp"
                    :isMyself="message.author.equals(workspace.wallet!.publicKey)"
                >
                    {{ message.data }}
                </ChatMessage>
            </div>
        </div>
    </ScrollArea>
</template>

<style scoped>
    .chat-scroll-area {
        width: 100%;
        height: 100%;
        padding-left: 0.6rem;
        padding-right: 0.6rem;
    }
    .chat-message-sequence {
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: 0.4rem;
        margin-block: 0.4rem;
    }
    .chat-message-sequence-messages {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 0.4rem;
    }
</style>
