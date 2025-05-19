import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { describe, it } from "node:test";
import { assert, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import Logging from "../utils/Logging.ts";

use(chaiAsPromised);

function handleAnchorError(_error: any): anchor.AnchorError {
    assert.isTrue(_error instanceof anchor.AnchorError);
    const error: anchor.AnchorError = _error;
    // Logging.logAnchorError(error);
    // Logging.logProgramLogs(error);

    return error;
}

describe("CreateConversation", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const payer = provider.wallet as anchor.Wallet;

    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;

    it("Create conversation when passed 2-4 chatters", async () => {
        const newConversationAccountKeypair = new anchor.web3.Keypair();
        const anotherChatterKeypair = new anchor.web3.Keypair();
        const chatters = [payer.publicKey, anotherChatterKeypair.publicKey];

        var instruction = await program.methods
            .createConversation(chatters)
            .accounts({
                payer: payer.publicKey,
                conversationAccount: newConversationAccountKeypair.publicKey,
            })
            .instruction();
        var transaction = new anchor.web3.Transaction().add(instruction);
        const tx = await provider.sendAndConfirm(transaction, [newConversationAccountKeypair]);

        const accInfo = await provider.connection.getAccountInfo(newConversationAccountKeypair.publicKey);
        assert(accInfo.lamports > 0, "Account not found");
        // Logging.logProgramLogs(provider, tx);
    });

    it("Reject with 'NotEnoughChatters' when passed less than 2 chatters", async () => {
        const newConversationAccountKeypair = new anchor.web3.Keypair();
        const chatters = [payer.publicKey];

        try {
            const tx = await program.methods
                .createConversation(chatters)
                .accounts({
                    payer: payer.publicKey,
                    conversationAccount: newConversationAccountKeypair.publicKey,
                })
                .signers([newConversationAccountKeypair])
                .rpc();
            assert.ok(false);
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "NotEnoughChatters");
            assert.strictEqual(err.error.errorCode.number, 6000);
            // Logging.logProgramLogs(err);
        }
    });

    it("Reject with 'TooManyChatters' when passed more than 4 chatters", async () => {
        const newConversationAccountKeypair = new anchor.web3.Keypair();
        const chatters = [
            payer.publicKey,
            new anchor.web3.Keypair().publicKey,
            new anchor.web3.Keypair().publicKey,
            new anchor.web3.Keypair().publicKey,
            new anchor.web3.Keypair().publicKey,
        ];

        try {
            const tx = await program.methods
                .createConversation(chatters)
                .accounts({
                    payer: payer.publicKey,
                    conversationAccount: newConversationAccountKeypair.publicKey,
                })
                .signers([newConversationAccountKeypair])
                .rpc();
            assert.ok(false);
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "TooManyChatters");
            assert.strictEqual(err.error.errorCode.number, 6001);
            // Logging.logProgramLogs(err);
        }
    });

    it("Reject with 'PayerNotInChatters' when payer is not in chatters", async () => {
        const newConversationAccountKeypair = new anchor.web3.Keypair();
        const chatters = [new anchor.web3.Keypair().publicKey, new anchor.web3.Keypair().publicKey];

        try {
            const tx = await program.methods
                .createConversation(chatters)
                .accounts({
                    payer: payer.publicKey,
                    conversationAccount: newConversationAccountKeypair.publicKey,
                })
                .signers([newConversationAccountKeypair])
                .rpc();
            assert.ok(false);
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "PayerNotInChatters");
            assert.strictEqual(err.error.errorCode.number, 6003);
            // Logging.logProgramLogs(err);
        }
    });

    it("Reject with 'ConversationAccountIsChatter' when conversation account is in chatters", async () => {
        const newConversationAccountKeypair = new anchor.web3.Keypair();
        const chatters = [newConversationAccountKeypair.publicKey, payer.publicKey];

        try {
            const tx = await program.methods
                .createConversation(chatters)
                .accounts({
                    payer: payer.publicKey,
                    conversationAccount: newConversationAccountKeypair.publicKey,
                })
                .signers([newConversationAccountKeypair])
                .rpc();
            assert.ok(false);
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "ConversationAccountIsChatter");
            assert.strictEqual(err.error.errorCode.number, 6004);
            // Logging.logProgramLogs(err);
        }
    });

    it("Reject with 'RepeatedChatters' when passed repeated chatters", async () => {
        const newConversationAccountKeypair = new anchor.web3.Keypair();
        const repeatedChatterKeypair = new anchor.web3.Keypair();
        const chatters = [payer.publicKey, repeatedChatterKeypair.publicKey, repeatedChatterKeypair.publicKey];

        try {
            const tx = await program.methods
                .createConversation(chatters)
                .accounts({
                    payer: payer.publicKey,
                    conversationAccount: newConversationAccountKeypair.publicKey,
                })
                .signers([newConversationAccountKeypair])
                .rpc();
            assert.ok(false);
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "RepeatedChatters");
            assert.strictEqual(err.error.errorCode.number, 6002);
            // Logging.logProgramLogs(err);
        }
    });
});
