<script setup>
import { WalletMultiButton } from "solana-wallets-vue";
import { useWorkspace, initWorkspace } from "@/anchor/workspace";

// TODO: try to create a conversation with wallet address
initWorkspace();
// TODO: figure out where initWorkspace should be called
const workspace = useWorkspace();
</script>

<template>
    <div class="about">
        <WalletMultiButton></WalletMultiButton>
        <br />
        <h1>This is an about page</h1>
        <div v-if="workspace !== null">
            <p>
                {{ workspace.program.value.programId.toBase58() }}
            </p>
            <p v-if="workspace.provider.value.publicKey !== undefined">
                {{ workspace.provider.value.publicKey.toBase58() }}
            </p>
            <p>
                {{ workspace.provider.value.connection.rpcEndpoint }}
            </p>
            <p v-if="workspace.provider.value.wallet !== undefined">
                {{ workspace.provider.value.wallet.publicKey.toBase58() }}
            </p>
            <p>
                {{ workspace.program.value.idl }}
            </p>
        </div>
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
