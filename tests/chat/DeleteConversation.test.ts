import { beforeEach, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { expect } from "chai";

describe("delete_conversation instruction", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;
    const user = provider.wallet.publicKey;

    const conversationId = "test-conv-" + Math.floor(Math.random() * 10000);
    const [conversationPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(conversationId)],
        program.programId
    );

    beforeEach(async () => {
        const chatter = anchor.web3.Keypair.generate();

        await program.methods
            .createConversation(conversationId, [user, chatter.publicKey])
            .accounts({ payer: user })
            .rpc();
    });

    it("deletes a conversation account", async () => {
        await program.methods.deleteConversation(conversationId).accounts({ payer: user }).rpc();

        const accountInfo = await provider.connection.getAccountInfo(conversationPDA);
        expect(accountInfo === null);
    });
});
