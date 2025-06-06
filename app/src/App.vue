<script setup lang="ts">
import BlockWrapper from "@/components/BlockWrapper.vue";
import Button from "@/components/Button.vue";
import ConversationList from "@/components/ConversationList.vue";
import ElementWrapper from "@/components/ElementWrapper.vue";
import WalletBalanceElement from "@/components/WalletBalanceElement.vue";
import { PublicKey } from "@solana/web3.js";
import { RouterLink, RouterView } from "vue-router";
import { WalletMultiButton } from "solana-wallets-vue";
import { computed, ref, watch } from "vue";
import { useWorkspace } from "@/anchor/workspace";

const workspace = useWorkspace();

const hasSolanaAccount = ref<boolean>(false);
const hasConversationListAccount = ref<boolean>(false);
const walletExists = computed((): boolean => hasSolanaAccount.value && !hasConversationListAccount.value);
const walletRegistered = computed((): boolean => hasSolanaAccount.value && hasConversationListAccount.value);

async function checkWalletAccounts() {
    const publicKey = workspace.wallet.value?.publicKey;
    if (!publicKey) {
        hasSolanaAccount.value = false;
        hasConversationListAccount.value = false;
        return;
    }

    const [conversationListPDA] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), Buffer.from("chats")],
        workspace.program.value.programId,
    );
    console.log("Conversation List PDA:", conversationListPDA.toBase58());
    const accountInfo = await workspace.connection.getAccountInfo(publicKey);
    const conversationListInfo = await workspace.connection.getAccountInfo(conversationListPDA);
    console.log("COnversation List Account Info:", conversationListInfo);
    hasSolanaAccount.value = !!accountInfo;
    hasConversationListAccount.value = conversationListInfo !== null;
}

// Optionally, watch wallet changes and check automatically
watch(
    () => workspace.wallet.value?.publicKey,
    () => {
        checkWalletAccounts();
    },
    { immediate: true },
);

function echo() {
    console.log("Echo function called");
}
</script>

<template>
    <BlockWrapper>
        <header>
            <!-- TODO: logo -->
            <h1>Chat On Solana</h1>
        </header>
    </BlockWrapper>

    <BlockWrapper class="horizontal-layout">
        <!-- TODO: Wallet info -->
        <WalletMultiButton></WalletMultiButton>
        <ElementWrapper>{{ workspace.wallet.value?.publicKey.toBase58() || "Wallet not connected" }} </ElementWrapper>
        <ElementWrapper>{{ workspace.connection.rpcEndpoint }} </ElementWrapper>
        <ElementWrapper>
            <Suspense>
                <WalletBalanceElement />
                <template #fallback>Loading balance...</template>
            </Suspense>
        </ElementWrapper>
    </BlockWrapper>

    <div class="horizontal-layout">
        <BlockWrapper class="sidebar">
            <!-- TODO: remove router for now -->
            <!-- <nav>
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/about">About</RouterLink>
            </nav> -->
            <ConversationList />
        </BlockWrapper>

        <BlockWrapper class="content">
            <main>
                <!-- <RouterView /> -->
                <!-- TODO: conversation view -->
                <div v-if="walletExists">
                    Looks like your Wallet is present on Solana ledger! Please register a Chat account using button
                    below.
                    <!-- TODO: create_conversation_list account button -->
                    <Button @click="echo()">Essa</Button>
                </div>
                <div v-else-if="walletRegistered">Content</div>
                <div v-else>Wallet not connected. Please connect your Wallet in order to use the Chat.</div>
            </main>
        </BlockWrapper>
    </div>
</template>

<style scoped>
.horizontal-layout {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin: 0;
}

.sidebar {
    min-width: max(20%, 200px);
    max-width: 20%;
    text-align: center;
    border: solid red 1px;
}

.content {
    min-width: 200px;
    flex-grow: 1;
    border: solid blue 1px;
}
</style>
