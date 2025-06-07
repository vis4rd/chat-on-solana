<script setup lang="ts">
import { ref } from "vue";
import { useWorkspace } from "@/anchor/workspace";
import { PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";

const workspace = useWorkspace();
const conversationId = ref("");
const chatters = ref<string[]>([""]);
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

function addChatterField() {
    if (chatters.value.length < 4) chatters.value.push("");
}
function removeChatterField(index: number) {
    if (chatters.value.length > 1) chatters.value.splice(index, 1);
}

async function createConversation() {
    error.value = null;
    success.value = null;
    if (!conversationId.value) {
        error.value = "Conversation ID is required.";
        return;
    }
    if (chatters.value.length < 2) {
        error.value = "At least 2 chatters required.";
        return;
    }
    const payer = workspace.wallet.value?.publicKey;
    const wallet = workspace.wallet.value;
    if (!payer || !wallet) {
        error.value = "Wallet not connected.";
        return;
    }
    try {
        loading.value = true;
        const chatterPubkeys = chatters.value.map((c) => new PublicKey(c));
        // Derive the conversation PDA
        const [conversationPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from(conversationId.value)],
            workspace.program.value.programId,
        );
        // Compose both instructions in a single transaction
        const ix1 = await workspace.program.value.methods
            .createConversation(conversationId.value, chatterPubkeys)
            .accounts({
                payer: payer,
            })
            .instruction();
        const ix2 = await workspace.program.value.methods
            .appendConversationToList(conversationPDA)
            .accounts({
                user: payer,
            })
            .instruction();
        const transaction = new Transaction().add(ix1, ix2);
        const latestBlockhash = await workspace.connection.getLatestBlockhash();
        transaction.feePayer = payer;
        transaction.recentBlockhash = latestBlockhash.blockhash;
        const signed = await wallet.signTransaction(transaction);
        const sig = await workspace.connection.sendRawTransaction(signed.serialize());
        success.value = `Conversation created! Tx: ${sig}`;
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div>
        <h2>New Conversation</h2>
        <form @submit.prevent="createConversation">
            <div>
                <label>Conversation ID:</label>
                <input v-model="conversationId" maxlength="32" required />
            </div>
            <div>
                <label>Chatters (public keys):</label>
                <div
                    v-for="(chatter, idx) in chatters"
                    :key="idx"
                    style="display: flex; gap: 0.5rem; align-items: center"
                >
                    <input v-model="chatters[idx]" required placeholder="Chatter public key" style="width: 350px" />
                    <button type="button" @click="removeChatterField(idx)" v-if="chatters.length > 1">-</button>
                    <button
                        type="button"
                        @click="addChatterField"
                        v-if="idx === chatters.length - 1 && chatters.length < 4"
                    >
                        +
                    </button>
                </div>
            </div>
            <div style="margin-top: 1rem">
                <button type="submit" :disabled="loading">Create Conversation</button>
            </div>
            <div v-if="error" style="color: red">{{ error }}</div>
            <div v-if="success" style="color: green">{{ success }}</div>
        </form>
    </div>
</template>
