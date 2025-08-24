import { beforeEach, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert } from "chai";

describe("create_conversation_list instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const payer = anchor.web3.Keypair.generate();
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;

    beforeEach(async () => {
        const connection = provider.connection;
        const sig = await connection.requestAirdrop(payer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(
            { signature: sig, ...(await connection.getLatestBlockhash()) },
            "confirmed"
        );
    });

    const [conversationListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("chats")],
        program.programId
    );

    it("creates a conversation list account for the user", async () => {
        await program.methods.createConversationList().accounts({ user: payer.publicKey }).signers([payer]).rpc();

        const acc = await program.account.conversationListAccount.fetch(conversationListPDA);
        assert.isArray(acc.conversationIds);
        assert.strictEqual(acc.conversationIds.length, 0);
        assert.strictEqual(acc.authority.toBase58(), payer.publicKey.toBase58());
    });

    it("fails if the account already exists", async () => {
        await assert.isRejected(
            program.methods.createConversationList().accounts({ user: payer.publicKey }).signers([payer]).rpc(),
            /already in use|Account in use/
        );
    });
});
