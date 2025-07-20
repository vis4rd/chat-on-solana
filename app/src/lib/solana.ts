import { PublicKey, type AccountInfo, type Connection } from "@solana/web3.js";

export async function getConversationListAccount(
    userPublicKey: PublicKey,
    programId: PublicKey,
    connection: Connection,
): Promise<AccountInfo<Buffer> | null> {
    const [conversationListPDA] = PublicKey.findProgramAddressSync(
        [userPublicKey.toBuffer(), Buffer.from("chats")],
        programId,
    );
    return connection.getAccountInfo(conversationListPDA);
}

export async function getWalletAccount(
    publicKey: PublicKey,
    connection: Connection,
): Promise<AccountInfo<Buffer> | null> {
    return connection.getAccountInfo(publicKey);
}
