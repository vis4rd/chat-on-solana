<script setup lang="ts">
    import ChatMessage from "@/components/ChatMessage.vue";
    import ChatMessageAuthor from "@/components/ChatMessageAuthor.vue";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { PublicKey } from "@solana/web3.js";
    import { toast } from "vue-sonner";
    import { computed, onUnmounted, type ComputedRef, type ModelRef } from "vue";

    type ChatMessage = { data: string; author: PublicKey; timestamp: number };
    type ConversationAccount = {
        authority: PublicKey;
        chatterCount: number;
        chatters: PublicKey[];
        messages: ChatMessage[];
    };
    type ChatMessageSequenceWithTimestamp = { timestamp: number; messages: ChatMessage[] };
    type ChatMessageSequenceWithAuthor = { author: PublicKey; messages: ChatMessage[] };
    type ChatMessageSequenceWithAuthorSequenceWithTimestamp = {
        timestamp: number;
        messageSequencesWithAuthor: ChatMessageSequenceWithAuthor[];
    };

    const workspace = useAnchorWorkspaceStore();
    const conversationDefault: ConversationAccount = {
        authority: PublicKey.default,
        chatterCount: 0,
        chatters: [],
        messages: [],
    };

    const props = defineProps<{ accountPda: PublicKey | undefined }>();
    const conversation: ModelRef<ConversationAccount> = defineModel("conversationAccount", {
        default: { authority: PublicKey.default, chatterCount: 0, chatters: [], messages: [] },
    });

    const messages: ComputedRef<ChatMessage[]> = computed(() => conversation.value.messages);
    const messageSequencesByTimestamp: ComputedRef<ChatMessageSequenceWithTimestamp[]> = computed(() => {
        const sequences: ChatMessageSequenceWithTimestamp[] = [];
        let currentSequence: ChatMessageSequenceWithTimestamp | null = null;

        messages.value.forEach((message) => {
            if (!currentSequence || message.timestamp - currentSequence.timestamp > 5 * 60) {
                // New sequence if more than 5 minutes have passed
                if (currentSequence) {
                    sequences.push(currentSequence);
                }
                currentSequence = { timestamp: message.timestamp, messages: [message] };
            } else {
                currentSequence.messages.push(message);
            }
        });

        if (currentSequence) {
            sequences.push(currentSequence);
        }

        return sequences;
    });
    const messageSequencesByTimestampThenAuthor: ComputedRef<ChatMessageSequenceWithAuthorSequenceWithTimestamp[]> =
        computed(() => {
            const sequencesOfSequences: ChatMessageSequenceWithAuthorSequenceWithTimestamp[] = [];
            let currentSequence: ChatMessageSequenceWithAuthorSequenceWithTimestamp | null = null;

            messageSequencesByTimestamp.value.forEach((sequence) => {
                currentSequence = { timestamp: sequence.timestamp, messageSequencesWithAuthor: [] };

                let currentSequenceWithAuthor: ChatMessageSequenceWithAuthor | null = null;
                sequence.messages.forEach((message) => {
                    if (!currentSequenceWithAuthor) {
                        currentSequenceWithAuthor = { author: message.author, messages: [message] };
                        return;
                    }

                    if (message.author.equals(currentSequenceWithAuthor.author)) {
                        // Same author as previous message
                        currentSequenceWithAuthor.messages.push(message);
                        return;
                    }

                    // Different author, push the current sequence and start a new one
                    currentSequence!.messageSequencesWithAuthor.push(currentSequenceWithAuthor);
                    currentSequenceWithAuthor = { author: message.author, messages: [message] };
                });

                currentSequence.messageSequencesWithAuthor.push(currentSequenceWithAuthor!);
                sequencesOfSequences.push(currentSequence);
            });

            return sequencesOfSequences;
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
        // console.debug("Conversation updated:", updatedConversation);
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
            v-for="(messageSequenceSequenceWithTimestamp, index) in messageSequencesByTimestampThenAuthor"
            :key="index"
            class="chat-message-sequence-sequence"
        >
            <span class="chat-message-sequence-timestamp">
                {{
                    new Date(messageSequenceSequenceWithTimestamp.timestamp * 1000)
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")
                }}
            </span>
            <div
                v-for="(messageSequence, index) in messageSequenceSequenceWithTimestamp.messageSequencesWithAuthor"
                :key="index"
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
    .chat-message-sequence-timestamp {
        display: flex;
        place-content: center;
        width: 100%;
        color: var(--color-muted-foreground);
        font-size: 0.7rem;
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
