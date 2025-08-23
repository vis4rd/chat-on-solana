import { afterEach, before, beforeEach, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert } from "chai";

describe("remove_conversation_from_list instruction", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;
    const payer = anchor.web3.Keypair.generate();

    const conversationId = "test-conv-" + Math.floor(Math.random() * 10000);
    const [conversationListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("chats")],
        program.programId
    );

    before(async () => {
        const connection = provider.connection;
        const sig = await connection.requestAirdrop(payer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(
            { signature: sig, ...(await connection.getLatestBlockhash()) },
            "confirmed"
        );

        await program.methods.createConversationList().accounts({ user: payer.publicKey }).signers([payer]).rpc();
    });

    beforeEach(async () => {
        await program.methods
            .appendConversationToList(conversationId)
            .accounts({ user: payer.publicKey })
            .signers([payer])
            .rpc();
    });

    afterEach(async () => {
        try {
            await program.methods
                .deleteConversation(conversationId)
                .accounts({ payer: payer.publicKey })
                .signers([payer])
                .rpc();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
    });

    it("removes a conversation from the user's list", async () => {
        await program.methods
            .removeConversationFromList(conversationId)
            .accounts({ user: payer.publicKey })
            .signers([payer])
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        assert.isArray(acc.conversationIds);
        assert.notInclude(acc.conversationIds, conversationId);
    });

    it("does not throw when removing a non-existent conversationId from the user's list", async () => {
        const fakeId = "not-present-" + Math.floor(Math.random() * 10000);
        let error = null;
        try {
            await program.methods
                .removeConversationFromList(fakeId)
                .accounts({ user: payer.publicKey })
                .signers([payer])
                .rpc();
        } catch (e) {
            error = e;
        }
        assert.isNull(error, "Should not throw when removing a non-existent conversationId");
    });
});
