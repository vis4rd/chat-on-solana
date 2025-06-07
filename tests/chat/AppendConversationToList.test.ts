import * as anchor from "@coral-xyz/anchor";
import { describe, it, before } from "node:test";
import { assert } from "chai";
import * as IDL from "../../target/types/chat.ts";

describe("append_conversation_to_list instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const payer = provider.wallet as anchor.Wallet;
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;

    const [conversationListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("chats")],
        program.programId,
    );

    const conversationId = "test-convo";

    before(async () => {
        // Ensure the conversation list account exists
        try {
            await program.methods
                .createConversationList()
                .accounts({
                    user: payer.publicKey,
                })
                .rpc();
        } catch {
            // Ignore if already exists
        }
        // Create the conversation account for the test
        await program.methods
            .createConversation(conversationId, [payer.publicKey, anchor.web3.Keypair.generate().publicKey])
            .accounts({
                payer: payer.publicKey,
            })
            .rpc();
    });

    it("appends a conversation id to the user's list", async () => {
        await program.methods
            .appendConversationToList(conversationId)
            .accounts({
                user: payer.publicKey,
            })
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        assert.include(acc.conversationIds, conversationId);
    });

    it("does not append the same conversation id twice", async () => {
        // TODO: refactor to init the test with a clean state when deleteConversation is implemented
        await program.methods
            .appendConversationToList(conversationId)
            .accounts({
                user: payer.publicKey,
            })
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        const occurrences = acc.conversationIds.filter((id: string) => id === conversationId).length;
        assert.strictEqual(occurrences, 1);
    });

    it("appends a different conversation id", async () => {
        const conversationId2 = "test-convo-2";
        await program.methods
            .createConversation(conversationId2, [payer.publicKey, anchor.web3.Keypair.generate().publicKey])
            .accounts({
                payer: payer.publicKey,
            })
            .rpc();
        await program.methods
            .appendConversationToList(conversationId2)
            .accounts({
                user: payer.publicKey,
            })
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        assert.include(acc.conversationIds, conversationId2);
        assert.strictEqual(acc.conversationIds.length, 2);
    });
});
