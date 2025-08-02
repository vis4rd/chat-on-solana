<script setup lang="ts">
    import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";
    import { RouterView, useRouter } from "vue-router";
    import { watch } from "vue";

    const workspace = useAnchorWorkspaceStore();
    const router = useRouter();

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
</script>

<template>
    <RouterView class="content" />
</template>

<style scoped></style>
