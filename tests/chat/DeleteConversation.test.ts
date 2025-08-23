import { beforeEach, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { expect } from "chai";

describe("delete_conversation instruction", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;
    const payer = anchor.web3.Keypair.generate();

    const conversationId = "test-conv-" + Math.floor(Math.random() * 10000);
    const [conversationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(conversationId)],
        program.programId
    );

    beforeEach(async () => {
        const connection = provider.connection;
        const chatter = anchor.web3.Keypair.generate();

        const sig = await connection.requestAirdrop(payer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(
            { signature: sig, ...(await connection.getLatestBlockhash()) },
            "confirmed"
        );

        await program.methods
            .createConversation(conversationId, [payer.publicKey, chatter.publicKey])
            .accounts({ authority: payer.publicKey })
            .signers([payer])
            .rpc();
    });

    it("deletes a conversation account", async () => {
        await program.methods
            .deleteConversation(conversationId)
            .accounts({ payer: payer.publicKey })
            .signers([payer])
            .rpc();

        const accountInfo = await provider.connection.getAccountInfo(conversationPDA);
        expect(accountInfo === null);
    });
});
