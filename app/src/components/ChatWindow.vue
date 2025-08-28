<script setup lang="ts">
    import BlockWrapper from "@/components/BlockWrapper.vue";
    import ChatMessage from "@/components/ChatMessage.vue";
    import ChatWindowConversationHistory from "@/components/ChatWindowConversationHistory.vue";
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import InviteChoiceChatBox from "@/components/InviteChoiceChatBox.vue";
    import { Button } from "@/components/ui/button";
    import { FormControl, FormField, FormItem } from "@/components/ui/form";
    import { Input } from "@/components/ui/input";
    import { Skeleton } from "@/components/ui/skeleton";
    import { appendMessage, deleteConversationAccount, removeConversationFromList } from "@/lib/solana";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { useConversationListStore } from "@/stores/conversation_list";
    import { Icon } from "@iconify/vue";
    import { PublicKey } from "@solana/web3.js";
    import { toTypedSchema } from "@vee-validate/zod";
    import { useForm } from "vee-validate";
    import { toast } from "vue-sonner";
    import { computed, ref } from "vue";
    import * as z from "zod";

    const conversationListStore = useConversationListStore();
    const workspace = useAnchorWorkspaceStore();
    const conversationDefault: ConversationAccount = {
        authority: PublicKey.default,
        chatterCount: 0,
        chatters: [],
        messages: [],
    };

    type ChatMessage = { data: string; author: PublicKey; timestamp: number };
    type ConversationAccount = {
        authority: PublicKey;
        chatterCount: number;
        chatters: PublicKey[];
        messages: ChatMessage[];
    };

    const input = ref("");
    const inputLength = computed(() => input.value.trim().length);
    const conversation = ref<ConversationAccount>(conversationDefault);
    const chatterCount = computed(() => conversation.value.chatterCount);
    const messageCount = computed(() => conversation.value.messages.length);

    function isMessageValid() {
        return inputLength.value > 0 && inputLength.value <= 100;
    }

    // DOCS: https://zod.dev/basics
    const formSchema = toTypedSchema(
        z.object({
            message_content: z
                .string()
                .min(1)
                .max(100)
                .refine(() => isMessageValid(), { message: "Message must be between 1 and 100 characters." }),
        })
    );

    const { handleSubmit } = useForm({ validationSchema: formSchema });

    const onSubmit = handleSubmit((values) => {
        appendMessage(conversationListStore.selectedChat!.pda, values.message_content)
            .then(() => {
                input.value = "";
            })
            .catch((err: Error) => {
                toast.error("Failed to send message.", { description: err.message, duration: 10000 });
            });
    });

    function copyConversationAddress() {
        if (conversationListStore.selectedChat?.pda) {
            navigator.clipboard.writeText(conversationListStore.selectedChat.pda.toBase58());
            // TODO: notification that address was copied successfully
        } else {
            // TODO: notification about failure
        }
    }

    function leaveChat() {
        if (!conversationListStore.selectedChat?.id) {
            toast.error("No conversation selected.", { duration: 5000 });
            return;
        }

        const conversationId = conversationListStore.selectedChat!.id;
        removeConversationFromList(conversationId)
            .then(() => {
                conversationListStore.deselectChat();
                conversationListStore.conversations = conversationListStore.conversations.filter(
                    (conv) => conv !== conversationId
                );
                conversation.value = conversationDefault;
                toast.success(`Left the "${conversationId}" chat.`, { duration: 5000 });
            })
            .catch((err: Error) => {
                toast.error("Failed to leave conversation.", { description: err.message, duration: 10000 });
            });
    }

    function deleteChat() {
        if (!conversationListStore.selectedChat?.id) {
            toast.error("No conversation selected.", { duration: 5000 });
            return;
        }

        const conversationId = conversationListStore.selectedChat!.id;
        deleteConversationAccount(conversationId)
            .then(() => {
                conversationListStore.deselectChat();
                conversationListStore.conversations = conversationListStore.conversations.filter(
                    (conv) => conv !== conversationId
                );
                conversation.value = conversationDefault;
                toast.success(`Deleted the "${conversationId}" chat.`, { duration: 5000 });
            })
            .catch((err: Error) => {
                toast.error("Failed to delete conversation.", { description: err.message, duration: 10000 });
            });
    }

    function isAnyChatSelected() {
        return conversationListStore.isChatSelected();
    }
    function isAnyInviteSelected() {
        return conversationListStore.isInviteSelected();
    }
    function hasAuthority() {
        return conversation.value.authority.toBase58() === workspace.wallet?.publicKey.toBase58();
    }
    function doesChatExist() {
        return conversation.value.chatterCount > 0;
    }
</script>

<template>
    <div class="column">
        <div class="row">
            <ElementWrapper class="w-1/2">
                <b v-if="conversationListStore.selectedChat">{{ conversationListStore.selectedChat?.id }}</b>
                <span v-else>Select a chat</span>
            </ElementWrapper>
            <ElementWrapper> chatters: {{ chatterCount }}</ElementWrapper>
            <ElementWrapper> messages: {{ messageCount }}/50 </ElementWrapper>
            <Button
                @click="copyConversationAddress()"
                class="grow"
                variant="outline"
                aria-label="Share conversation address"
                :disabled="!isAnyChatSelected() || !doesChatExist()"
            >
                <Icon icon="fluent:share-24-regular" class="size-5" />
                Share
            </Button>
        </div>
        <BlockWrapper class="chat-window">
            <div class="chat-box" v-if="!isAnyChatSelected() && !isAnyInviteSelected()">Select a chat</div>
            <Suspense v-else-if="isAnyInviteSelected()">
                <InviteChoiceChatBox class="chat-box" />
            </Suspense>
            <!-- TODO: add note about the chat no longer existing -->
            <Suspense v-else :key="conversationListStore.selectedChat?.pda">
                <ChatWindowConversationHistory
                    v-model="conversation"
                    :account-pda="conversationListStore.selectedChat?.pda"
                />
                <template #fallback>
                    <Skeleton class="skeleton" />
                </template>
            </Suspense>
        </BlockWrapper>

        <div class="message-input">
            <form v-if="isAnyChatSelected() && doesChatExist()" class="form-component" @submit="onSubmit">
                <FormField v-slot="{ componentField }" name="message_content">
                    <FormItem class="full-width">
                        <FormControl>
                            <Input v-bind="componentField" v-model="input" placeholder="Type a message..." />
                        </FormControl>
                        <!-- <FormMessage /> -->
                    </FormItem>
                </FormField>

                <ElementWrapper class="character-count">{{ 100 - inputLength }}</ElementWrapper>
                <Button variant="default" size="icon" aria-label="Send the message" :disabled="!isMessageValid()">
                    <Icon icon="fluent:send-24-regular" class="size-5" />
                </Button>
            </form>
            <ElementWrapper v-else class="form-component">
                <Icon icon="fluent:lock-closed-24-regular" class="size-5" />
            </ElementWrapper>
        </div>
        <div class="row">
            <Button
                @click="leaveChat()"
                class="limit-width"
                variant="destructive"
                :disabled="!isAnyChatSelected() || hasAuthority()"
            >
                <Icon v-if="!isAnyChatSelected()" icon="fluent:lock-closed-24-regular" class="size-5" />
                <span v-else>Leave chat</span>
            </Button>
            <Button
                @click="deleteChat()"
                class="limit-width"
                variant="destructive"
                :disabled="!isAnyChatSelected() || !hasAuthority()"
            >
                <Icon v-if="!isAnyChatSelected()" icon="fluent:lock-closed-24-regular" class="size-5" />
                <span v-else>Delete chat</span>
            </Button>
            <ElementWrapper>{{ conversation.authority.toBase58() }}</ElementWrapper>
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
    .row {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        width: 100%;
    }
    .skeleton {
        height: calc(var(--spacing) * 9);
        width: 100%;
        margin-block: 0.5rem;
    }
    .chat-window {
        display: flex;
        flex-direction: column;
        margin-block: 0;
        width: 100%;
        /* 100vh = viewport height 100% */
        /* 36px  = message input height */
        /* 2rem  = message input margins */
        /* 58px  = wallet button height */
        /* 48px  = title element height */
        /* 36px  = chat header row height */
        /* 4rem  = the rest of gaps/margins */
        height: calc(100vh - 36px - 2rem - 4rem - 58px - 48px - 36px);
        min-height: 10rem;
    }
    .chat-box {
        width: 100%;
        height: 100%;
        text-align: center;
        place-content: center;
    }
    .message-input {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        align-items: center;
    }
    .form-component {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        width: 100%;
    }
    .full-width {
        width: 100%;
    }
    .character-count {
        color: v-bind('(100 - inputLength) < 20 ? "var(--color-destructive)" : "var(--color-foreground)"');
    }
    .limit-width {
        width: 150px;
    }
</style>
