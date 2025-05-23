import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { describe, it } from "node:test";
import { assert, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { handleAnchorError } from "../utils/Error.ts";
import { generateRandomString } from "../utils/Random.ts";
// import Logging from "../utils/Logging.ts";

use(chaiAsPromised);

describe("CreateConversation", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const payer = provider.wallet as anchor.Wallet;

    var program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;

    it("Create conversation when passed 2-4 chatters", async () => {
        const anotherChatterKeypair = new anchor.web3.Keypair();
        const chatters = [payer.publicKey, anotherChatterKeypair.publicKey];
        const conversationId: string = generateRandomString(1, 32);
        const seeds = [Buffer.from(conversationId)];
        const [conversationPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);

        try {
            const tx = await program.methods
                .createConversation(conversationId, chatters)
                .accounts({
                    payer: payer.publicKey,
                })
                .rpc();
        } catch (e) {
            const err = handleAnchorError(e);
        }

        // Logging.logProgramLogs(provider, tx);
        const accInfo = await provider.connection.getAccountInfo(conversationPda);
        assert(accInfo.lamports > 0, "Account not found");
    });

    it("Reject with 'NotEnoughChatters' when passed less than 2 chatters", async () => {
        const chatters = [payer.publicKey];
        const conversationId: string = generateRandomString(1, 32);

        try {
            const tx = await program.methods
                .createConversation(conversationId, chatters)
                .accounts({
                    payer: payer.publicKey,
                })
                .rpc();
            assert.ok(false, "The transaction is expected to fail.");
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "NotEnoughChatters");
            assert.strictEqual(err.error.errorCode.number, 6000);
            // Logging.logProgramLogs(err);
        }
    });

    it("Reject with 'TooManyChatters' when passed more than 4 chatters", async () => {
        const chatters = [
            payer.publicKey,
            new anchor.web3.Keypair().publicKey,
            new anchor.web3.Keypair().publicKey,
            new anchor.web3.Keypair().publicKey,
            new anchor.web3.Keypair().publicKey,
        ];
        const conversationId: string = generateRandomString(1, 32);

        try {
            const tx = await program.methods
                .createConversation(conversationId, chatters)
                .accounts({
                    payer: payer.publicKey,
                })
                .rpc();
            assert.ok(false, "The transaction is expected to fail.");
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "TooManyChatters");
            assert.strictEqual(err.error.errorCode.number, 6001);
            // Logging.logProgramLogs(err);
        }
    });

    it("Reject with 'PayerNotInChatters' when payer is not in chatters", async () => {
        const chatters = [new anchor.web3.Keypair().publicKey, new anchor.web3.Keypair().publicKey];
        const conversationId: string = generateRandomString(1, 32);

        try {
            const tx = await program.methods
                .createConversation(conversationId, chatters)
                .accounts({
                    payer: payer.publicKey,
                })
                .rpc();
            assert.ok(false, "The transaction is expected to fail.");
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "PayerNotInChatters");
            assert.strictEqual(err.error.errorCode.number, 6003);
            // Logging.logProgramLogs(err);
        }
    });

    it("Reject with 'ConversationAccountIsChatter' when conversation account is in chatters", async () => {
        const conversationId: string = generateRandomString(1, 32);
        const seeds = [Buffer.from(conversationId)];
        const [conversationPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);
        const chatters = [conversationPda, payer.publicKey];

        try {
            const tx = await program.methods
                .createConversation(conversationId, chatters)
                .accounts({
                    payer: payer.publicKey,
                })
                .rpc();
            assert.ok(false, "The transaction is expected to fail.");
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "ConversationAccountIsChatter");
            assert.strictEqual(err.error.errorCode.number, 6004);
            // Logging.logProgramLogs(err);
        }
    });

    it("Reject with 'RepeatedChatters' when passed repeated chatters", async () => {
        const repeatedChatterKeypair = new anchor.web3.Keypair();
        const chatters = [payer.publicKey, repeatedChatterKeypair.publicKey, repeatedChatterKeypair.publicKey];
        const conversationId: string = generateRandomString(1, 32);

        try {
            const tx = await program.methods
                .createConversation(conversationId, chatters)
                .accounts({
                    payer: payer.publicKey,
                })
                .rpc();
            assert.ok(false, "The transaction is expected to fail.");
        } catch (e) {
            const err = handleAnchorError(e);
            assert.strictEqual(err.error.errorCode.code, "RepeatedChatters");
            assert.strictEqual(err.error.errorCode.number, 6002);
            // Logging.logProgramLogs(err);
        }
    });

    it("Reject with 'TooLongConversationId' when conversationId is too long", async () => {
        const anotherChatterKeypair = new anchor.web3.Keypair();
        const chatters = [payer.publicKey, anotherChatterKeypair.publicKey];
        const conversationId: string = generateRandomString(33, 40);
        try {
            await program.methods
                .createConversation(conversationId, chatters)
                .accounts({
                    payer: payer.publicKey,
                })
                .rpc();
            assert.ok(false, "The transaction is expected to fail.");
        } catch (e) {
            // console.log(e);
        }
    });
});
