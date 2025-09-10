import { before, beforeEach, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert } from "chai";

describe("leave_chat instruction", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;
    const payer = anchor.web3.Keypair.generate();

    let currentChatId: string;
    const [chatListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("chat_list")],
        program.programId
    );

    before(async () => {
        const connection = provider.connection;
        const sig = await connection.requestAirdrop(payer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(
            { signature: sig, ...(await connection.getLatestBlockhash()) },
            "confirmed"
        );
        await program.methods.registerUser().accounts({ authority: payer.publicKey }).signers([payer]).rpc();
    });

    beforeEach(async () => {
        currentChatId = "test-chat-" + "-" + Math.floor(Math.random() * 10000);
        await program.methods
            .createChat(currentChatId, [payer.publicKey, anchor.web3.Keypair.generate().publicKey])
            .accounts({ authority: payer.publicKey })
            .signers([payer])
            .rpc();
    });

    it("removes a chat from the user's list", async () => {
        await program.methods.leaveChat(currentChatId).accounts({ authority: payer.publicKey }).signers([payer]).rpc();
        const acc = await program.account.chatListAccount.fetch(chatListPDA);
        assert.isArray(acc.chatIds);
        assert.notInclude(acc.chatIds, currentChatId);
    });

    it("does not throw when removing a non-existent chat ID from the user's list", async () => {
        const fakeId = "not-present-" + Math.floor(Math.random() * 10000);
        let error = null;
        try {
            await program.methods.leaveChat(fakeId).accounts({ authority: payer.publicKey }).signers([payer]).rpc();
        } catch (e) {
            error = e;
        }
        assert.isNull(error, "Should not throw when removing a non-existent chatId");
    });

    it("does not remove a chat due to wrong authority", async () => {
        const wrongAuthority = anchor.web3.Keypair.generate();
        await assert.isRejected(
            program.methods
                .leaveChat(currentChatId)
                .accountsPartial({ authority: wrongAuthority.publicKey, chatListAccount: chatListPDA })
                .signers([wrongAuthority])
                .rpc(),
            /(InvalidAuthority|ConstraintSeeds)/
        );
        const acc = await program.account.chatListAccount.fetch(chatListPDA);
        assert.include(acc.chatIds, currentChatId);
    });
});
