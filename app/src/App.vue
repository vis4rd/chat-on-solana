<script setup lang="ts">
    import BlockWrapper from "@/components/BlockWrapper.vue";
    import DarkModeToggle from "@/components/DarkModeToggle.vue";
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import ViewManager from "@/components/ViewManager.vue";
    import WalletBalanceElement from "@/components/WalletBalanceElement.vue";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { WalletMultiButton } from "solana-wallets-vue";
    import { useRoute } from "vue-router";
    import { watch } from "vue";

    const workspace = useAnchorWorkspaceStore();
    const route = useRoute();

    watch(
        // TODO: DEBUG, please remove
        () => route.fullPath,
        (newRoute, oldRoute) => {
            console.log("Route changed: ", oldRoute, "->", newRoute);
        }
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
        <ElementWrapper v-if="workspace.isAtLeastConnected()">
            {{ workspace.wallet?.publicKey.toBase58() || "Wallet not connected" }}
        </ElementWrapper>
        <ElementWrapper v-if="workspace.isAtLeastConnected()">
            {{ workspace.connection!.rpcEndpoint }}
        </ElementWrapper>
        <ElementWrapper>
            <Suspense>
                <WalletBalanceElement />
                <template #fallback>Loading...</template>
            </Suspense>
        </ElementWrapper>
        <ElementWrapper>
            {{ workspace.ready ? "RDY" : "%" }}
        </ElementWrapper>
        <DarkModeToggle />
    </div>

    <main class="full-width">
        <ViewManager />
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
