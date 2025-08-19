<script setup lang="ts">
    import BlockWrapper from "@/components/BlockWrapper.vue";
    import ChatMessage from "@/components/ChatMessage.vue";
    import ChatWindowConversationHistory from "@/components/ChatWindowConversationHistory.vue";
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import { Button } from "@/components/ui/button";
    import { FormControl, FormField, FormItem } from "@/components/ui/form";
    import { Input } from "@/components/ui/input";
    import { Skeleton } from "@/components/ui/skeleton";
    import { appendMessage } from "@/lib/solana";
    import { useConversationListStore } from "@/stores/conversation_list";
    import { Icon } from "@iconify/vue";
    import type { PublicKey } from "@solana/web3.js";
    import { toTypedSchema } from "@vee-validate/zod";
    import { useForm } from "vee-validate";
    import { computed, ref } from "vue";
    import * as z from "zod";

    const conversationListStore = useConversationListStore();

    type ChatMessage = { data: string; author: PublicKey; timestamp: number };
    type ConversationAccount = { chatterCount: number; chatters: PublicKey[]; messages: ChatMessage[] };

    const input = ref("");
    const inputLength = computed(() => input.value.trim().length);
    const conversation = ref<ConversationAccount>({ chatterCount: 0, chatters: [], messages: [] });

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
                .refine((val) => isMessageValid(), { message: "Message must be between 1 and 100 characters." }),
        })
    );

    const { handleSubmit } = useForm({ validationSchema: formSchema });

    const onSubmit = handleSubmit((values) => {
        appendMessage(conversationListStore.selectedChat!.pda, values.message_content).then(() => {
            input.value = "";
        });
    });
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

            <Suspense :key="conversationListStore.selectedChat!.pda">
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
            <form class="form-component" @submit="onSubmit">
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
</style>
