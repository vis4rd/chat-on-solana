<script setup lang="ts">
    import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";
    import { RouterView, useRoute, useRouter } from "vue-router";
    import { watch } from "vue";

    const workspace = useAnchorWorkspaceStore();
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
    <RouterView class="content" />
</template>

<style scoped></style>
