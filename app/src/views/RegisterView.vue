<script setup lang="ts">
import BlockWrapper from "@/components/BlockWrapper.vue";
import { Button } from "@/components/ui/button";
import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";

const workspace = useAnchorWorkspaceStore();

async function createConversationListAccount() {
    // TODO: Extract to helper file
    if (!workspace.isAtLeastConnected()) {
        return;
    }

    try {
        const publicKey = workspace.wallet!.publicKey;
        await workspace
            .program!.methods.createConversationList()
            .accounts({
                user: publicKey,
            })
            .rpc();
        // await checkWalletAccounts(); // TODO: Refresh state
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        // console.error(e);
    }
}
</script>

<template>
    <BlockWrapper>
        Looks like your Wallet is present on Solana ledger! Please register a Chat account using button below.
        <Button @click="createConversationListAccount()">Register now!</Button>
    </BlockWrapper>
</template>
