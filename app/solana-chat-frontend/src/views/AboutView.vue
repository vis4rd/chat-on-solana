<script setup>
import { WalletMultiButton } from "solana-wallets-vue";
// TODO: import workspace.ts and try to create a conversation with wallet address
</script>

<template>
    <div class="about">
        <WalletMultiButton></WalletMultiButton>
        <br />
        <h1>This is an about page</h1>
    </div>
</template>

<style>
@media (min-width: 1024px) {
    .about {
        min-height: 100vh;
        display: flex;
        align-items: center;
    }
}
</style>
