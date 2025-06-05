import * as anchor from "@coral-xyz/anchor";
import { describe, it } from "node:test";
import { assert } from "chai";
import * as IDL from "../../target/types/chat.ts";

describe("create_conversation_list instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const payer = provider.wallet as anchor.Wallet;
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;

    const [conversationListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("chats")],
        program.programId,
    );

    it("creates a conversation list account for the user", async () => {
        await program.methods
            .createConversationList()
            .accounts({
                user: payer.publicKey,
                conversationListAccount: conversationListPDA,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        assert.isArray(acc.conversationIds);
        assert.strictEqual(acc.conversationIds.length, 0);
    });

    it("fails if the account already exists", async () => {
        await assert.isRejected(
            program.methods
                .createConversationList()
                .accounts({
                    user: payer.publicKey,
                    conversationListAccount: conversationListPDA,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc(),
            /already in use|Account in use/,
        );
    });
});
