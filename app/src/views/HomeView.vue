<script setup lang="ts">
import Button from "@/components/Button.vue";
import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";
import { PublicKey } from "@solana/web3.js";
import { computed, ref, watch } from "vue";

const workspace = useAnchorWorkspaceStore();

async function createConversationListAccount() {
    if (workspace.walletConnectionState !== WalletConnectionState.Connected) {
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
    <div>
        <div v-if="workspace.isConnected()">
            Looks like your Wallet is present on Solana ledger! Please register a Chat account using button below.
            <Button @click="createConversationListAccount()">Register now!</Button>
        </div>
        <div v-else-if="workspace.isRegistered()">Content</div>
        <div v-else-if="workspace.isDisconnected()">
            Wallet not connected. Please connect your Wallet in order to use the Chat.
        </div>
        <div v-else>Unknown Wallet state...</div>
    </div>
</template>
