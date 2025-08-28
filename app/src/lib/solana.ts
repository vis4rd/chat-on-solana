import { Buffer } from "buffer";
import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
import { PublicKey, Transaction, type AccountInfo } from "@solana/web3.js";

async function signAndSendTransaction(transaction: Transaction, payer: PublicKey): Promise<string> {
    const workspace = useAnchorWorkspaceStore();

    transaction.feePayer = payer;

    try {
        const latestBlockhash = await workspace.connection!.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;

        const signedTx = await workspace.wallet!.signTransaction(transaction);
        const signature = await workspace.connection!.sendRawTransaction(signedTx.serialize());

        return Promise.resolve(signature);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function getConversationListAccount(userPublicKey: PublicKey): Promise<AccountInfo<Buffer> | null> {
    const workspace = useAnchorWorkspaceStore();

    const [conversationListPDA] = PublicKey.findProgramAddressSync(
        [userPublicKey.toBuffer(), Buffer.from("chats")],
        workspace.program!.programId
    );
    return workspace.connection!.getAccountInfo(conversationListPDA);
}

export async function getWalletAccount(publicKey: PublicKey): Promise<AccountInfo<Buffer> | null> {
    const workspace = useAnchorWorkspaceStore();

    return workspace.connection!.getAccountInfo(publicKey);
}

export async function createConversation(conversationId: string, chatters: string[]): Promise<string> {
    const workspace = useAnchorWorkspaceStore();

    const payer = workspace.wallet!.publicKey;
    try {
        const chatterPubkeys = chatters.map((c) => new PublicKey(c));
        // Compose both instructions in a single transaction
        const ix1 = await workspace
            .program!.methods.createConversation(conversationId, chatterPubkeys)
            .accounts({ authority: payer })
            .instruction();
        const ix2 = await workspace
            .program!.methods.appendConversationToList(conversationId)
            .accounts({ user: payer })
            .instruction();
        const tx = new Transaction().add(ix1, ix2);

        for (const kp of chatterPubkeys) {
            if (kp.equals(payer)) continue; // Skip self-invite
            const inviteIx = await workspace
                .program!.methods.addInviteToSomeonesList(kp, conversationId)
                .accounts({ sender: payer })
                .instruction();
            tx.add(inviteIx);
        }

        return signAndSendTransaction(tx, payer);
    } catch (e) {
        console.error("Error creating conversation:", e);
        return Promise.reject(e);
    }
}

export async function appendMessage(conversationPDA: PublicKey, message: string): Promise<string> {
    const trimmedMessage: string = message.trim();

    function isMessageValid() {
        const messageLength = trimmedMessage.length;
        return messageLength > 0 && messageLength <= 100;
    }

    const workspace = useAnchorWorkspaceStore();

    if (isMessageValid()) {
        try {
            const tx = await workspace
                .program!.methods.appendMessage(trimmedMessage)
                .accounts({ conversationAccount: conversationPDA, author: workspace.wallet!.publicKey })
                .transaction();

            return signAndSendTransaction(tx, workspace.wallet!.publicKey);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    return Promise.reject(new Error("Invalid message content"));
}

export async function removeConversationFromList(conversationId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();

    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }

    try {
        const tx = await workspace
            .program!.methods.removeConversationFromList(conversationId)
            .accounts({ authority: workspace.wallet!.publicKey })
            .transaction();

        return signAndSendTransaction(tx, workspace.wallet!.publicKey);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function deleteConversationAccount(conversationId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();

    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }

    try {
        const tx = await workspace
            .program!.methods.deleteConversation(conversationId)
            .accounts({ authority: workspace.wallet!.publicKey })
            .transaction();

        return signAndSendTransaction(tx, workspace.wallet!.publicKey);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function addInviteToSomeonesList(recipient: PublicKey, conversationId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();

    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }

    try {
        const tx = await workspace
            .program!.methods.addInviteToSomeonesList(recipient, conversationId)
            .accounts({ sender: workspace.wallet!.publicKey })
            .transaction();

        return signAndSendTransaction(tx, workspace.wallet!.publicKey);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function registerUser(owner: PublicKey): Promise<string> {
    const workspace = useAnchorWorkspaceStore();

    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }

    try {
        const tx = new Transaction();
        const ix1 = await workspace
            .program!.methods.createConversationList()
            .accounts({ authority: owner })
            .instruction();
        const ix2 = await workspace.program!.methods.createInviteList().accounts({ authority: owner }).instruction();
        tx.add(ix1, ix2);

        return signAndSendTransaction(tx, owner);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function acceptInvite(conversationId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();

    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }

    try {
        const tx = await workspace
            .program!.methods.acceptInvite(conversationId)
            .accounts({ authority: workspace.wallet!.publicKey })
            .transaction();

        return signAndSendTransaction(tx, workspace.wallet!.publicKey);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function rejectInvite(conversationId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();

    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }

    try {
        const tx = await workspace
            .program!.methods.rejectInvite(conversationId)
            .accounts({ authority: workspace.wallet!.publicKey })
            .transaction();

        return signAndSendTransaction(tx, workspace.wallet!.publicKey);
    } catch (error) {
        return Promise.reject(error);
    }
}
