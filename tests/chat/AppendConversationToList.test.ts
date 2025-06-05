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

    const conversationAddress = anchor.web3.Keypair.generate().publicKey;
    const conversationAddress2 = anchor.web3.Keypair.generate().publicKey;

    before(async () => {
        // Ensure the conversation list account exists
        try {
            await program.methods
                .createConversationList()
                .accounts({
                    user: payer.publicKey,
                })
                .rpc();
        } catch (e) {
            // Ignore if already exists
        }
    });

    it("appends a conversation address to the user's list", async () => {
        await program.methods
            .appendConversationToList(conversationAddress)
            .accounts({
                user: payer.publicKey,
            })
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        assert.include(acc.conversationIds, conversationAddress.toString());
    });

    it("does not append the same conversation twice", async () => {
        // TODO: this test should be refactored when delete_conversation_from_list is implemented
        await program.methods
            .appendConversationToList(conversationAddress)
            .accounts({
                user: payer.publicKey,
            })
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        const occurrences = acc.conversationIds.filter((id: string) => id === conversationAddress.toString()).length;
        assert.strictEqual(occurrences, 1);
    });

    it("appends a different conversation address", async () => {
        await program.methods
            .appendConversationToList(conversationAddress2)
            .accounts({
                user: payer.publicKey,
            })
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        assert.include(acc.conversationIds, conversationAddress2.toString());
        assert.strictEqual(acc.conversationIds.length, 2);
    });
});
