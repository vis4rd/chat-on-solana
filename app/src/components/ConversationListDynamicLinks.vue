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
            // Derive the PDA for the conversation_list_account
            const [conversationListPDA] = await PublicKey.findProgramAddress(
                [workspace.wallet!.publicKey.toBuffer(), Buffer.from("chats")],
                workspace.program!.programId
            );
            // Fetch the account
            const acc = await workspace.program!.account.conversationListAccount.fetch(conversationListPDA);
            conversationListStore.conversations = acc.conversationIds;

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
