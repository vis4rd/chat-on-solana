<script setup lang="ts">
    import DarkModeToggle from "@/components/DarkModeToggle.vue";
    import ElementWrapper from "@/components/ElementWrapper.vue";
    import { H2 } from "@/components/typography";
    import { Skeleton } from "@/components/ui/skeleton";
    import { Toaster } from "@/components/ui/sonner";
    import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";
    import { useColorMode } from "@vueuse/core";
    import { WalletMultiButton } from "solana-wallets-vue";
    import { RouterView, useRoute, useRouter } from "vue-router";
    import { computed, watch } from "vue";

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

    const router = useRouter();
    const route = useRoute();

    watch(
        () => workspace.walletConnectionState,
        (newState) => {
            if (newState === WalletConnectionState.Disconnected) {
                router.replace("/welcome");
            } else if (newState === WalletConnectionState.Present || newState === WalletConnectionState.Connected) {
                router.replace("/register");
            } else if (newState === WalletConnectionState.Registered) {
                router.replace("/chat");
            } else {
                router.replace("/");
            }
        },
        { immediate: true }
    );

    watch(
        // TODO: DEBUG, please remove
        () => route.fullPath,
        (newRoute, oldRoute) => {
            console.log("Route changed: ", oldRoute, "->", newRoute);
        }
    );
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
                {{ workspace.ready ? "RDY" : "..." }}
            </ElementWrapper>
            <DarkModeToggle />
        </div>
    </div>

    <main class="full-width">
        <Skeleton v-if="!workspace.ready" class="skeleton-block" />
        <RouterView v-else />
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

    .skeleton-block {
        margin-block: 1rem;
        width: 100%;
        min-height: 200px;
    }
</style>
