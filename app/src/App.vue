<script setup lang="ts">
    import DarkModeToggle from "@/components/DarkModeToggle.vue";
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import { H2 } from "@/components/typography";
    import { Toaster } from "@/components/ui/sonner";
    import ViewManager from "@/components/ViewManager.vue";
    // import WalletBalanceElement from "@/components/WalletBalanceElement.vue";
    import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
    import { useColorMode } from "@vueuse/core";
    import { WalletMultiButton } from "solana-wallets-vue";
    import { computed } from "vue";

    const workspace = useAnchorWorkspaceStore();
    const colorMode = useColorMode();
    const theme = computed(() => {
        switch (colorMode.value) {
            case "dark":
                return "dark";
            case "light":
                return "light";
            default:
                return "system";
        }
    });
</script>

<template>
    <Toaster richColors :theme="theme" />
    <div class="horizontal-layout">
        <H2 class="title">Chat on Solana</H2>
        <div class="right-align">
            <WalletMultiButton />
            <ElementWrapper>
                {{ workspace.connection?.rpcEndpoint }}
            </ElementWrapper>
            <!-- <ElementWrapper>
                <Suspense>
                    <WalletBalanceElement />
                    <template #fallback>Loading...</template>
                </Suspense>
            </ElementWrapper> -->
            <ElementWrapper>
                {{ workspace.ready ? "RDY" : "%" }}
            </ElementWrapper>
            <DarkModeToggle />
        </div>
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

    .title {
        display: flex;
        padding: 0;
        border: none;
    }

    .right-align {
        margin-top: 1.5rem;
        flex-grow: 1;

        display: flex;
        place-content: flex-end;
        gap: 1rem;
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
