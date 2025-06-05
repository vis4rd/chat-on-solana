<script setup lang="ts">
import { ref, watch } from "vue";
import { useWorkspace } from "@/anchor/workspace";

const workspace = useWorkspace();
const balance = ref<number | null>(null);

// Watch for wallet connection.
// It might be not connected before loading the component.
// User might connect a different wallet or disconnect completely.
// Await for new Promise allows <Suspense> compatibility.
await new Promise<void>((resolve) => {
    const second = 1000;
    const timeout = setTimeout(() => {
        balance.value = null;
        resolve();
    }, 5 * second);

    watch(
        () => workspace.wallet.value?.publicKey,
        async (publicKey) => {
            if (publicKey) {
                balance.value = await workspace.connection.getBalance(publicKey);
                clearTimeout(timeout);
                resolve();
            } else {
                balance.value = null;
            }
        },
        { immediate: true },
    );
});
</script>

<template>
    <div>
        <span v-if="balance !== null">
            Balance: <span>~{{ balance / 1e9 }} SOL</span>
        </span>
        <span v-else>
            <span>Wallet not connected</span>
        </span>
    </div>
</template>
