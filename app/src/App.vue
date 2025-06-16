<script setup lang="ts">
import BlockWrapper from "@/components/BlockWrapper.vue";
import Button from "@/components/Button.vue";
import ConversationList from "@/components/ConversationList.vue";
import ElementWrapper from "@/components/ElementWrapper.vue";
import WalletBalanceElement from "@/components/WalletBalanceElement.vue";
import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";
import { WalletMultiButton } from "solana-wallets-vue";
import { RouterLink, RouterView } from "vue-router";

const workspace = useAnchorWorkspaceStore();

async function createConversationListAccount() {
    // TODO: Extract to helper file, remove from here and HomeView.vue
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
    <BlockWrapper>
        <header>
            <!-- TODO: logo -->
            <h1>Chat On Solana</h1>
        </header>
    </BlockWrapper>

    <BlockWrapper class="horizontal-layout">
        <!-- TODO: Wallet info -->
        <WalletMultiButton></WalletMultiButton>
        <ElementWrapper v-if="workspace.walletConnectionState === WalletConnectionState.Connected">
            {{ workspace.wallet?.publicKey.toBase58() || "Wallet not connected" }}
        </ElementWrapper>
        <ElementWrapper v-if="workspace.walletConnectionState === WalletConnectionState.Connected">
            {{ workspace.connection!.rpcEndpoint }}
        </ElementWrapper>
        <ElementWrapper>
            <Suspense>
                <WalletBalanceElement />
                <template #fallback>Loading balance...</template>
            </Suspense>
        </ElementWrapper>
    </BlockWrapper>

    <BlockWrapper v-if="workspace.walletConnectionState === WalletConnectionState.Disconnected">
        Please select your wallet using button above.
    </BlockWrapper>
    <BlockWrapper v-else-if="workspace.walletConnectionState === WalletConnectionState.Connecting">
        Connecting to your wallet...
    </BlockWrapper>
    <BlockWrapper v-else-if="workspace.isConnected()">
        Looks like your Wallet is present on Solana ledger! Please register a Chat account using button below.
        <!-- TODO: Redirect to view /register -->
        <Button @click="createConversationListAccount()">Register now!</Button>
    </BlockWrapper>
    <div v-else class="horizontal-layout">
        <BlockWrapper class="sidebar">
            <!-- TODO: remove router for now -->
            <!-- <nav>
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/about">About</RouterLink>
            </nav> -->
            <ConversationList />
        </BlockWrapper>

        <BlockWrapper class="content">
            <main>
                <RouterView />
                <!-- TODO: conversation view -->
            </main>
        </BlockWrapper>
    </div>
</template>

<style scoped>
.horizontal-layout {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin: 0;
}

.sidebar {
    min-width: max(20%, 200px);
    max-width: 20%;
    text-align: center;
    border: solid red 1px;
}

.content {
    min-width: 200px;
    flex-grow: 1;
    border: solid blue 1px;
}
</style>
