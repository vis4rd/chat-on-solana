<script setup lang="ts">
    import { Buffer } from "buffer";
    import { Button } from "@/components/ui/button";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { useConversationListStore } from "@/stores/conversation_list";
    import { PublicKey } from "@solana/web3.js";

    const workspace = useAnchorWorkspaceStore();
    const conversationListStore = useConversationListStore();

    if (!workspace.isAtLeastConnected()) {
        conversationListStore.conversations = [];
    } else {
        try {
            // Derive the PDA for the chat_list_account
            const [chatListPda] = PublicKey.findProgramAddressSync(
                [workspace.wallet!.publicKey.toBuffer(), Buffer.from("chat_list")],
                workspace.program!.programId
            );
            const acc = await workspace.program!.account.chatListAccount.fetch(chatListPda);
            conversationListStore.conversations = acc.chatIds;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            conversationListStore.conversations = [];
        }
    }

    function setCurrentChat(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const conversationId = target.textContent?.trim();
        conversationListStore.setSelectedChat(conversationId!);
    }
</script>

<template>
    <Button variant="secondary" v-for="id in conversationListStore.conversations" :key="id" @click="setCurrentChat">
        {{ id }}
    </Button>
</template>
