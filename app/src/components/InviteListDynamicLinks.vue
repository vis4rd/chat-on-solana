<script setup lang="ts">
    import { Buffer } from "buffer";
    import { Button } from "@/components/ui/button";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { useConversationListStore } from "@/stores/conversation_list";
    import { PublicKey } from "@solana/web3.js";

    const workspace = useAnchorWorkspaceStore();
    const conversationListStore = useConversationListStore();

    if (!workspace.isAtLeastConnected()) {
        conversationListStore.invites = [];
    } else {
        try {
            const [inviteListPda] = PublicKey.findProgramAddressSync(
                [workspace.wallet!.publicKey.toBuffer(), Buffer.from("invite_list")],
                workspace.program!.programId
            );
            const acc = await workspace.program!.account.chatListAccount.fetch(inviteListPda);
            conversationListStore.invites = acc.chatIds;
        } catch {
            conversationListStore.invites = [];
        }
    }

    function setCurrentChat(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const inviteId = target.textContent?.trim();
        conversationListStore.setSelectedInvite(inviteId!);
    }
</script>

<template>
    <Button variant="secondary" v-for="id in conversationListStore.invites" :key="id" @click="setCurrentChat">
        {{ id }}
    </Button>
</template>
