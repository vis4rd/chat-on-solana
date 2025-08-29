<script setup lang="ts">
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import type { PublicKey } from "@solana/web3.js";
    import { toast } from "vue-sonner";

    type ChatMessage = { data: string; author: PublicKey; timestamp: number };
    type ConversationAccount = {
        authority: PublicKey;
        chatterCount: number;
        chatters: PublicKey[];
        messages: ChatMessage[];
    };

    const props = defineProps<{ author: PublicKey; conversation: ConversationAccount }>();
    const workspace = useAnchorWorkspaceStore();

    const author = props.author;

    function copyAuthorAddress() {
        try {
            window.navigator.clipboard
                .writeText(author.toBase58())
                .then(() => {
                    toast.success("Author address copied to clipboard!");
                })
                .catch((error: Error) => {
                    toast.warning("Author address could not be copied to clipboard", { description: error });
                });
        } catch {
            toast.warning("Author address could not be copied to clipboard", {
                description: "Not secure context. Clipboard API is available only under https sites.",
                duration: 5000,
            });
        }
    }
</script>

<template>
    <ElementWrapper
        v-if="!author.equals(workspace.wallet!.publicKey)"
        :class="author.toBase58() === conversation.authority.toBase58() ? 'admin' : ''"
        @click="copyAuthorAddress()"
        title="Click to copy full address"
        W
    >
        {{ author.toBase58().substring(0, 4) }}
        <!-- {{ author.toBase58() }} -->
    </ElementWrapper>
</template>

<style scoped>
    .admin {
        /* background-color: var(--color-accent); */
        color: gold;
    }
</style>
