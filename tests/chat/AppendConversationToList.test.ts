import { afterEach, before, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert } from "chai";

describe("append_conversation_to_list instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const payer = provider.wallet as anchor.Wallet;
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;

    const [conversationListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("chats")],
        program.programId
    );

    const conversationId = "test-convo";
    const conversationId2 = "test-convo-2";

    before(async () => {
        // Ensure the conversation list account exists
        try {
            await program.methods.createConversationList().accounts({ user: payer.publicKey }).rpc();
        } catch {
            // Ignore if already exists
        }
        // Create the conversation account for the test
        await program.methods
            .createConversation(conversationId, [payer.publicKey, anchor.web3.Keypair.generate().publicKey])
            .accounts({ authority: payer.publicKey })
            .rpc();
    });

    afterEach(async () => {
        try {
            await program.methods.removeConversationFromList(conversationId).accounts({ user: payer.publicKey }).rpc();
        } catch {
            // Ignore if already not present
        }
    });

    it("appends a conversation id to the user's list", async () => {
        await program.methods.appendConversationToList(conversationId).accounts({ authority: payer.publicKey }).rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        assert.include(acc.conversationIds, conversationId);
    });

    it("does not append the same conversation id twice", async () => {
        await program.methods.appendConversationToList(conversationId).accounts({ authority: payer.publicKey }).rpc();
        await program.methods.appendConversationToList(conversationId).accounts({ authority: payer.publicKey }).rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        const occurrences = acc.conversationIds.filter((id: string) => id === conversationId).length;
        assert.strictEqual(occurrences, 1);
    });

    it("appends a different conversation id", async () => {
        await program.methods.appendConversationToList(conversationId).accounts({ authority: payer.publicKey }).rpc();

        await program.methods
            .createConversation(conversationId2, [payer.publicKey, anchor.web3.Keypair.generate().publicKey])
            .accounts({ authority: payer.publicKey })
            .rpc();
        await program.methods.appendConversationToList(conversationId2).accounts({ authority: payer.publicKey }).rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        assert.include(acc.conversationIds, conversationId2);
        assert.strictEqual(acc.conversationIds.length, 2);
    }).finally(() => {
        // Clean up the second conversation
        program.methods
            .deleteConversation(conversationId2)
            .accounts({ payer: payer.publicKey })
            .rpc()
            .catch(() => {});
        program.methods
            .removeConversationFromList(conversationId2)
            .accounts({ user: payer.publicKey })
            .rpc()
            .catch(() => {});
    });

    it("does not append a conversation when authority is wrong", async () => {
        const wrongAuthority = anchor.web3.Keypair.generate();

        await assert.isRejected(
            program.methods
                .appendConversationToList(conversationId)
                .accountsPartial({ authority: wrongAuthority.publicKey, conversationListAccount: conversationListPDA })
                .signers([wrongAuthority])
                .rpc(),
            /(InvalidAuthority|ConstraintSeeds)/
        );
    });
});
