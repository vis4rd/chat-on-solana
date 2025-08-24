import { AnchorProvider, Program, setProvider, Wallet, workspace } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as IDL from "../target/types/chat.ts";
import dotenv from "dotenv";

dotenv.config();

/**
 * Deletes all conversation PDAs and the conversation list PDA for a given wallet.
 * @param targetAccount Account for which to delete PDAs
 * @param connection Solana connection
 */
export async function deleteAllPdaAccounts(targetAccount: PublicKey) {
    const provider = AnchorProvider.local(process.env.ANCHOR_PROVIDER_URL);
    setProvider(provider);
    const payer = provider.wallet as Wallet;
    const program = workspace.Chat as Program<IDL.Chat>;

    // 1. Find conversationListAccount PDA
    const [conversationListPda] = await PublicKey.findProgramAddress(
        [targetAccount.toBuffer(), Buffer.from("chats")],
        program.programId
    );

    console.log(`PublicKey targetAccount: ${targetAccount.toBase58()}`);
    console.log(`Conversation List PDA: ${conversationListPda.toBase58()}`);

    // 2. Fetch conversationListAccount data
    let conversationList;
    try {
        conversationList = await program.account.conversationListAccount.fetch(conversationListPda);
    } catch {
        console.log("No conversation list found for wallet.");
        return;
    }
    const conversationIds = conversationList.conversationIds;

    // 3. For each conversation_id, find and close the conversationAccount PDA
    for (const conversationId of conversationIds) {
        const [conversationPda] = await PublicKey.findProgramAddress([Buffer.from(conversationId)], program.programId);
        try {
            await program.methods
                .deleteConversation(conversationId)
                .accountsPartial({ authority: payer.publicKey, conversationAccount: conversationPda })
                .rpc();
            console.log(`Deleted conversation PDA: ${conversationPda.toBase58()}`);
        } catch (error) {
            console.log(`Failed to delete conversation PDA: ${conversationPda.toBase58()}, error: ${error}`);
        }
    }
}

// ES module main entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Usage: ts-node DeletePdaAccounts.ts <TARGET_ACCOUNT_PUBKEY>");
        process.exit(1);
    }
    const targetAccount = new PublicKey(args[0]);
    deleteAllPdaAccounts(targetAccount)
        .then(() => console.log("Done."))
        .catch((err) => {
            console.error("Error:", err);
            process.exit(1);
        });
}
