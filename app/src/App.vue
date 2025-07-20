<script setup lang="ts">
import BlockWrapper from "@/components/BlockWrapper.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import ElementWrapper from "@/components/ElementWrapper.vue";
import WalletBalanceElement from "@/components/WalletBalanceElement.vue";
import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";
import { WalletMultiButton } from "solana-wallets-vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { watch } from "vue";

const workspace = useAnchorWorkspaceStore();
const router = useRouter();
const route = useRoute();

watch(
    () => workspace.walletConnectionState,
    (newState) => {
        if (newState === WalletConnectionState.Present) {
            router.replace("/register");
        } else {
            router.replace("/");
        }
    },
    { immediate: true },
);

watch(
    // TODO: DEBUG, please remove
    () => route.fullPath,
    (newRoute, oldRoute) => {
        console.log("Route changed: ", oldRoute, "->", newRoute);
    },
);
</script>

<template>
    <BlockWrapper>
        <!-- TODO: logo -->
        <h1 class="">Chat On Solana</h1>
    </BlockWrapper>

    <div class="horizontal-layout">
        <!-- TODO: Wallet info -->
        <WalletMultiButton></WalletMultiButton>
        <ElementWrapper v-if="workspace.isConnected()">
            {{ workspace.wallet?.publicKey.toBase58() || "Wallet not connected" }}
        </ElementWrapper>
        <ElementWrapper v-if="workspace.isConnected()">
            {{ workspace.connection!.rpcEndpoint }}
        </ElementWrapper>
        <ElementWrapper>
            <Suspense>
                <WalletBalanceElement />
                <template #fallback>Loading balance...</template>
            </Suspense>
        </ElementWrapper>
        <DarkModeToggle />
    </div>

    <main class="full-width">
        <BlockWrapper v-if="workspace.isDisconnected()"> Please select your wallet using button above. </BlockWrapper>
        <BlockWrapper v-else-if="workspace.isConnecting()"> Connecting to your wallet... </BlockWrapper>
        <!-- if isConnected() ==> using router.replace with watch() -->
        <RouterView v-else class="content" />
        <!-- TODO: conversation view -->
    </main>
</template>

<style scoped>
.horizontal-layout {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin: 0;
}

.full-width {
    width: 100%;
    margin: 0;
    padding: 0;
}

.content {
    min-width: 200px;
    flex-grow: 1;
}
</style>
