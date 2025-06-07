<script setup lang="ts">
import BlockWrapper from "@/components/BlockWrapper.vue";
import ConversationList from "@/components/ConversationList.vue";
import ElementWrapper from "@/components/ElementWrapper.vue";
import WalletBalanceElement from "@/components/WalletBalanceElement.vue";
import { RouterLink, RouterView } from "vue-router";
import { WalletMultiButton } from "solana-wallets-vue";
import { useWorkspace } from "@/anchor/workspace";

const workspace = useWorkspace();
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
        <ElementWrapper>{{ workspace.wallet.value?.publicKey.toBase58() || "Wallet not connected" }} </ElementWrapper>
        <ElementWrapper>{{ workspace.connection.rpcEndpoint }} </ElementWrapper>
        <ElementWrapper>
            <Suspense>
                <WalletBalanceElement />
                <template #fallback>Loading balance...</template>
            </Suspense>
        </ElementWrapper>
    </BlockWrapper>

    <div class="horizontal-layout">
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
