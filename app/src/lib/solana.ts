import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
import { PublicKey, Transaction, type AccountInfo } from "@solana/web3.js";

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
            .accounts({ payer: payer })
            .instruction();
        const ix2 = await workspace
            .program!.methods.appendConversationToList(conversationId)
            .accounts({ user: payer })
            .instruction();
        const transaction = new Transaction().add(ix1, ix2);
        const latestBlockhash = await workspace.connection!.getLatestBlockhash();
        transaction.feePayer = payer;
        transaction.recentBlockhash = latestBlockhash.blockhash;
        const signed = await workspace.wallet!.signTransaction(transaction);
        const sig = await workspace.connection!.sendRawTransaction(signed.serialize());
        return Promise.resolve(sig);
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

            const latestBlockhash = await workspace.connection!.getLatestBlockhash();
            tx.feePayer = workspace.wallet!.publicKey;
            tx.recentBlockhash = latestBlockhash.blockhash;
            const signedTx = await workspace.wallet!.signTransaction(tx);
            const txSignature = await workspace.provider!.connection.sendRawTransaction(signedTx.serialize());
            return Promise.resolve(txSignature);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    return Promise.reject(new Error("Invalid message content"));
}
