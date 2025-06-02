<script setup>
import { WalletMultiButton } from "solana-wallets-vue";
import { useWorkspace } from "@/anchor/workspace";
import * as anchor from "@coral-xyz/anchor";

const workspace = useWorkspace();

async function createConversation() {
    const anotherChatterKeypair = new anchor.web3.Keypair();

    const tx = workspace.program.value.methods
        .createConversation("some-conversation", [workspace.wallet.value.publicKey, anotherChatterKeypair.publicKey])
        .accounts({
            payer: workspace.wallet.value.publicKey,
        })
        .signers([workspace.wallet.value])
        .transaction();

    tx.then(async (transaction) => {
        console.log("Transaction created:", transaction);
        const latestBlockhash = await workspace.provider.value.connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = workspace.wallet.value.publicKey;
        return workspace.wallet.value.signTransaction(transaction);
    })
        .then((signedTx) => {
            console.log("Signed transaction:", signedTx);
            return workspace.provider.value.connection.sendRawTransaction(signedTx.serialize());
        })
        .then((txSignature) => {
            console.log("Transaction signature:", txSignature);
            document.getElementById("essa").innerHTML = `Transaction signature: ${txSignature}`;
        })
        .catch((error) => {
            console.error("Error creating conversation:", error);
            document.getElementById("essa").innerHTML = `Error creating conversation: ${error}`;
        });
}

async function fetchConversations() {
    try {
        const conversations = await workspace.program.value.account.conversationAccount.fetch(
            "DECV4rgx1zy3H62xN7xLwAnBsBbzUWzDnZu95YeFCJrs",
        );
        console.log("Conversations:", conversations);
        document.getElementById("oof").innerHTML = JSON.stringify(conversations, null, 2);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        document.getElementById("oof").innerHTML = `Error fetching conversations: ${error}`;
    }
}

async function appendMessage() {
    try {
        const tx = await workspace.program.value.methods
            .appendMessage("Hello, world!")
            .accounts({
                conversationAccount: "DECV4rgx1zy3H62xN7xLwAnBsBbzUWzDnZu95YeFCJrs",
                author: workspace.wallet.value.publicKey,
            })
            .signers([workspace.wallet.value])
            .transaction();

        const latestBlockhash = await workspace.provider.value.connection.getLatestBlockhash();
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = workspace.wallet.value.publicKey;

        const signedTx = await workspace.wallet.value.signTransaction(tx);
        const txSignature = await workspace.provider.value.connection.sendRawTransaction(signedTx.serialize());
        console.log("Message appended, transaction signature:", txSignature);
    } catch (error) {
        console.error("Error appending message:", error);
    }
}
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
        <div>
            <button @click="createConversation">Create Conversation</button>
        </div>
        <div id="essa"></div>
        <br />
        <br />
        <div>
            <button @click="fetchConversations">Fetch all conversationAccounts</button>
        </div>
        <div id="oof"></div>
        <div>
            <button @click="appendMessage">Append Message</button>
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
