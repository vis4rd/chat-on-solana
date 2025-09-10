import { beforeEach, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert, expect } from "chai";

describe("delete_chat instruction", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;
    const payer = anchor.web3.Keypair.generate();

    const chatId = "test-chat-" + Math.floor(Math.random() * 10000);
    const [chatPDA] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from(chatId)], program.programId);

    beforeEach(async () => {
        const connection = provider.connection;
        const chatter = anchor.web3.Keypair.generate();
        const sig = await connection.requestAirdrop(payer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(
            { signature: sig, ...(await connection.getLatestBlockhash()) },
            "confirmed"
        );
        await program.methods
            .registerUser()
            .accounts({ authority: payer.publicKey })
            .signers([payer])
            .rpc()
            .catch(() => {});
        await program.methods
            .createChat(chatId, [payer.publicKey, chatter.publicKey])
            .accounts({ authority: payer.publicKey })
            .signers([payer])
            .rpc();
    });

    it("deletes a conversation account and removes its ID from the chat list", async () => {
        const [chatListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [payer.publicKey.toBuffer(), Buffer.from("chat_list")],
            program.programId
        );

        const preList = await program.account.chatListAccount.fetch(chatListPDA);
        assert.include(preList.chatIds, chatId, "chat ID should be present before deletion");

        await program.methods.deleteChat(chatId).accounts({ authority: payer.publicKey }).signers([payer]).rpc();

        const accountInfo = await provider.connection.getAccountInfo(chatPDA);
        expect(accountInfo === null);

        const postList = await program.account.chatListAccount.fetch(chatListPDA);
        assert.notInclude(postList.chatIds, chatId, "chat ID should be removed from chat list after deletion");
    });

    it("does not delete a conversation due to wrong authority (unregistered user) and chat ID remains in list", async () => {
        const wrongAuthority = anchor.web3.Keypair.generate();
        const [chatListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [payer.publicKey.toBuffer(), Buffer.from("chat_list")],
            program.programId
        );

        const preList = await program.account.chatListAccount.fetch(chatListPDA);
        assert.include(preList.chatIds, chatId, "chat ID should be present before failed deletion attempt");

        await assert.isRejected(
            program.methods
                .deleteChat(chatId)
                .accounts({ authority: wrongAuthority.publicKey })
                .signers([wrongAuthority])
                .rpc(),
            /(AccountNotInitialized|InvalidAuthority)/
        );

        const accountInfo = await provider.connection.getAccountInfo(chatPDA);
        expect(accountInfo !== null);

        const postList = await program.account.chatListAccount.fetch(chatListPDA);
        assert.include(postList.chatIds, chatId, "chat ID should still be present after failed deletion attempt");
    });
});
