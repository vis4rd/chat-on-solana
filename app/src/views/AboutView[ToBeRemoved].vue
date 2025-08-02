<script setup lang="ts">
    import { useAnchorWorkspaceStore, WalletConnectionState } from "@/stores/anchor_workspace";
    import * as anchor from "@coral-xyz/anchor";

    const workspace = useAnchorWorkspaceStore();

    async function createConversation() {
        if (workspace.walletConnectionState !== WalletConnectionState.Connected) {
            return;
        }

        const anotherChatterKeypair = new anchor.web3.Keypair();

        const tx = workspace
            .program!.methods.createConversation("some-conversation", [
                workspace.wallet!.publicKey,
                anotherChatterKeypair.publicKey,
            ])
            .accounts({ payer: workspace.wallet!.publicKey })
            .signers([workspace.wallet!])
            .transaction();

        tx.then(async (transaction) => {
            console.log("Transaction created:", transaction);
            const latestBlockhash = await workspace.provider!.connection.getLatestBlockhash();
            transaction.recentBlockhash = latestBlockhash.blockhash;
            transaction.feePayer = workspace.wallet!.publicKey;
            return workspace.wallet!.signTransaction(transaction);
        })
            .then((signedTx) => {
                console.log("Signed transaction:", signedTx);
                return workspace.provider!.connection.sendRawTransaction(signedTx.serialize());
            })
            .then((txSignature) => {
                console.log("Transaction signature:", txSignature);
                document.getElementById("essa").innerHTML = `Transaction signature: ${txSignature}`;
            })
            .catch((error) => {
                console.error("Error creating conversation:", error);
                document!.getElementById("essa").innerHTML = `Error creating conversation: ${error}`;
            });
    }

    async function fetchConversations() {
        if (workspace.walletConnectionState !== WalletConnectionState.Connected) {
            document.getElementById("oof").innerHTML = `Wallet not connected`;
            return;
        }

        try {
            const conversations = await workspace.program!.account.conversationAccount.fetch(
                "DECV4rgx1zy3H62xN7xLwAnBsBbzUWzDnZu95YeFCJrs"
            );
            console.log("Conversations:", conversations);
            document.getElementById("oof").innerHTML = JSON.stringify(conversations, null, 2);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            document.getElementById("oof").innerHTML = `Error fetching conversations: ${error}`;
        }
    }

    async function appendMessage() {
        if (workspace.walletConnectionState !== WalletConnectionState.Connected) {
            console.error("Wallet not connected");
            return;
        }

        try {
            const tx = await workspace
                .program!.methods.appendMessage("Hello, world!")
                .accounts({
                    conversationAccount: "DECV4rgx1zy3H62xN7xLwAnBsBbzUWzDnZu95YeFCJrs",
                    author: workspace.wallet!.publicKey,
                })
                .signers([workspace.wallet!])
                .transaction();

            const latestBlockhash = await workspace.provider!.connection.getLatestBlockhash();
            tx.recentBlockhash = latestBlockhash.blockhash;
            tx.feePayer = workspace.wallet!.publicKey;

            const signedTx = await workspace.wallet!.signTransaction(tx);
            const txSignature = await workspace.provider!.connection.sendRawTransaction(signedTx.serialize());
            console.log("Message appended, transaction signature:", txSignature);
        } catch (error) {
            console.error("Error appending message:", error);
        }
    }
</script>

<template>
    <div class="about">
        <h1>This is an about page</h1>
        <div v-if="workspace !== null">
            <p>
                {{ workspace.program!.programId.toBase58() }}
            </p>
            <p v-if="workspace.walletConnectionState === WalletConnectionState.Connected">
                {{ workspace.provider!.publicKey.toBase58() }}
            </p>
            <p v-if="workspace.walletConnectionState === WalletConnectionState.Connected">
                {{ workspace.provider!.connection.rpcEndpoint }}
            </p>
            <p v-if="workspace.walletConnectionState === WalletConnectionState.Connected">
                {{ workspace.provider!.wallet.publicKey.toBase58() }}
            </p>
            <p>
                {{ workspace.program!.idl }}
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

<style scoped></style>
