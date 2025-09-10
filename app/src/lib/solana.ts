import { Buffer } from "buffer";
import { useAnchorWorkspaceStore } from "@/stores/anchor_workspace";
import { PublicKey, Transaction, type AccountInfo } from "@solana/web3.js";

// PDA seed constants (must match program)
const CHAT_LIST_SEED = "chat_list" as const;
const INVITE_LIST_SEED = "invite_list" as const;

// Helper PDA derivations mirroring on-chain seeds
function deriveChatPda(chatId: string, programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from(chatId)], programId);
}
function deriveChatListPda(authority: PublicKey, programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([authority.toBuffer(), Buffer.from(CHAT_LIST_SEED)], programId);
}
function deriveInviteListPda(authority: PublicKey, programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([authority.toBuffer(), Buffer.from(INVITE_LIST_SEED)], programId);
}

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
    const [chatListPda] = deriveChatListPda(userPublicKey, workspace.program!.programId);
    return workspace.connection!.getAccountInfo(chatListPda);
}

export async function getWalletAccount(publicKey: PublicKey): Promise<AccountInfo<Buffer> | null> {
    const workspace = useAnchorWorkspaceStore();

    return workspace.connection!.getAccountInfo(publicKey);
}

export async function acceptInvite(chatId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();
    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }
    const authority = workspace.wallet!.publicKey;
    const program = workspace.program!;
    // const [inviteListPda] = deriveInviteListPda(authority, program.programId);
    // const [chatListPda] = deriveChatListPda(authority, program.programId);
    try {
        const tx = await program.methods.acceptInvite(chatId).accounts({ authority }).transaction();
        return signAndSendTransaction(tx, authority);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function appendMessage(chatAccountPda: PublicKey, message: string): Promise<string> {
    const trimmed = message.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
        return Promise.reject(new Error("Invalid message length"));
    }

    const workspace = useAnchorWorkspaceStore();
    try {
        const tx = await workspace
            .program!.methods.appendMessage(trimmed)
            .accounts({ chatAccount: chatAccountPda, author: workspace.wallet!.publicKey })
            .transaction();
        return signAndSendTransaction(tx, workspace.wallet!.publicKey);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function createChat(chatId: string, chatters: string[]): Promise<string> {
    const workspace = useAnchorWorkspaceStore();
    const program = workspace.program!;
    const authority = workspace.wallet!.publicKey;
    // const programId = program.programId;

    try {
        const chatterPubkeys = chatters.map((c) => new PublicKey(c));
        // const [chatAccountPda] = deriveChatPda(chatId, programId);
        // const [chatListPda] = deriveChatListPda(authority, programId);

        const tx = new Transaction();
        const ix = await program.methods.createChat(chatId, chatterPubkeys).accounts({ authority }).instruction();
        tx.add(ix);

        for (const chatter_pubkey of chatterPubkeys) {
            if (chatter_pubkey.equals(authority)) continue;
            // const [inviteListPda] = deriveInviteListPda(chatter_pubkey, programId);
            const invite_ix = await program.methods
                .inviteAnotherUser(chatter_pubkey, chatId)
                .accounts({ sender: authority })
                .instruction();
            tx.add(invite_ix);
        }

        return signAndSendTransaction(tx, authority);
    } catch (e) {
        return Promise.reject(e);
    }
}

export async function deleteChat(chatId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();
    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }
    const authority = workspace.wallet!.publicKey;
    const program = workspace.program!;
    // const programId = program.programId;
    // const [chatAccountPda] = deriveChatPda(chatId, programId);
    // const [chatListPda] = deriveChatListPda(authority, programId);
    try {
        const tx = await program.methods.deleteChat(chatId).accounts({ authority }).transaction();
        return signAndSendTransaction(tx, authority);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function inviteAnotherUser(recipient: PublicKey, chatId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();
    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }
    const sender = workspace.wallet!.publicKey;
    const program = workspace.program!;
    // const [recipientInviteListPda] = deriveInviteListPda(recipient, program.programId);
    try {
        const tx = await program.methods
            .inviteAnotherUser(recipient, chatId)
            .accounts({
                sender,
                // recipientsInviteListAccount: recipientInviteListPda,
            })
            .transaction();
        return signAndSendTransaction(tx, sender);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function leaveChat(chatId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();
    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }
    const authority = workspace.wallet!.publicKey;
    const program = workspace.program!;
    // const [chatListPda] = deriveChatListPda(authority, program.programId);
    try {
        const tx = await program.methods.leaveChat(chatId).accounts({ authority }).transaction();
        return signAndSendTransaction(tx, authority);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function registerUser(owner: PublicKey): Promise<string> {
    const workspace = useAnchorWorkspaceStore();
    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }
    const program = workspace.program!;
    // const [chatListPda] = deriveChatListPda(owner, program.programId);
    // const [inviteListPda] = deriveInviteListPda(owner, program.programId);
    try {
        const ix = await program.methods.registerUser().accounts({ authority: owner }).instruction();
        return signAndSendTransaction(new Transaction().add(ix), owner);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function rejectInvite(chatId: string): Promise<string> {
    const workspace = useAnchorWorkspaceStore();
    if (!workspace.isAtLeastConnected()) {
        return Promise.reject(new Error("Wallet is not connected."));
    }
    const authority = workspace.wallet!.publicKey;
    const program = workspace.program!;
    // const [inviteListPda] = deriveInviteListPda(authority, program.programId);
    try {
        const tx = await program.methods.rejectInvite(chatId).accounts({ authority }).transaction();
        return signAndSendTransaction(tx, authority);
    } catch (error) {
        return Promise.reject(error);
    }
}
