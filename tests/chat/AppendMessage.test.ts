import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { describe, it, before } from "node:test";
import { assert, use } from "chai";
import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

describe("append_message instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    var program = anchor.workspace.Chat as anchor.Program<typeof IDL.Chat>;
    const payer = provider.wallet as anchor.Wallet;
    const conversationId: string = "test-convo";
    const [conversationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(conversationId)],
        program.programId
    );
    const chatters: anchor.web3.PublicKey[] = [payer.publicKey, anchor.web3.Keypair.generate().publicKey];

    before(async () => {
        await program.methods
            .createConversation(conversationId, chatters)
            .accounts({
                payer: payer.publicKey,
            })
            .rpc();
    });

    it("appends a message from a valid chatter", async () => {
        const expectedMessage = "Hello, world!";
        await program.methods
            .appendMessage(expectedMessage)
            .accounts({
                conversationAccount: conversationPda,
                author: payer.publicKey,
            })
            .rpc();
        const acc = await program.account.conversationAccount.fetch(conversationPda);
        assert.equal(acc.messages[0].data, expectedMessage);
        assert.equal(acc.messages[0].author.toBase58(), payer.publicKey.toBase58());
    });

    it("rejects a message that is too long", async () => {
        const longMessage = "a".repeat(101);
        await assert.isRejected(
            program.methods
                .appendMessage(longMessage)
                .accounts({
                    conversationAccount: conversationPda,
                    author: payer.publicKey,
                })
                .rpc(),
            /MessageTooLong/
        );
    });

    it("rejects a message from a non-chatter", async () => {
        const outsider = anchor.web3.Keypair.generate();
        await assert.isRejected(
            program.methods
                .appendMessage("Not allowed!")
                .accounts({
                    conversationAccount: conversationPda,
                    author: outsider.publicKey,
                })
                .signers([outsider])
                .rpc(),
            /PayerNotInChatters/
        );
    });

    it("removes the oldest message when at max capacity", async () => {
        // Fill up to 50 messages in a single transaction (actually 2 transactions due to size restrictions)
        for (let j = 0; j < 2; j++) {
            const tx = new anchor.web3.Transaction();
            for (let i = 0; i < 25; i++) {
                const ix = await program.methods
                    .appendMessage(`msg${i}`)
                    .accounts({
                        conversationAccount: conversationPda,
                        author: payer.publicKey,
                    })
                    .instruction();
                tx.add(ix);
            }
            await provider.sendAndConfirm(tx, []);
        }

        // Add one more, should remove the oldest
        await program.methods
            .appendMessage("newest")
            .accounts({
                conversationAccount: conversationPda,
                author: payer.publicKey,
            })
            .rpc();
        const acc = await program.account.conversationAccount.fetch(conversationPda);
        assert.equal(acc.messages.length, 50);
        assert.equal(acc.messages[0].data, "msg1"); // msg0 should be removed
        assert.equal(acc.messages[49].data, "newest");
    });
});
