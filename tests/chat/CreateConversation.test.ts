import { describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import chaiAsPromised from "chai-as-promised";
import * as IDL from "../../target/types/chat.ts";
import { handleAnchorError } from "../utils/Error.ts";
import { generateRandomString } from "../utils/Random.ts";
import { assert, use } from "chai";

// import Logging from "../utils/Logging.ts";

use(chaiAsPromised);

describe("CreateConversation", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const payer = provider.wallet as anchor.Wallet;

    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;

    it("Create conversation when passed 2-4 chatters", async () => {
        const anotherChatterKeypair = anchor.web3.Keypair.generate();
        const chatters = [payer.publicKey, anotherChatterKeypair.publicKey];
        const conversationId: string = generateRandomString(1, 32);
        const seeds = [Buffer.from(conversationId)];
        const [conversationPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);

        try {
            await program.methods
                .createConversation(conversationId, chatters)
                .accounts({ authority: payer.publicKey })
                .rpc();
        } catch (e) {
            handleAnchorError(e);
        }

        // Logging.logProgramLogs(provider, tx);
        const accInfo = await provider.connection.getAccountInfo(conversationPda);
        assert.isNotNull(accInfo, "Account not found");
        assert(accInfo.lamports > 0, "Account not found");

        const acc = await program.account.conversationAccount.fetch(conversationPda);
        assert.equal(acc.authority.toBase58(), payer.publicKey.toBase58());
        assert.equal(acc.chatterCount, chatters.length);
        assert.equal(acc.messages.length, 0);
        assert.deepEqual(acc.chatters, chatters);
    });

    it("Reject with 'NotEnoughChatters' when passed less than 2 chatters", async () => {
        const chatters = [payer.publicKey];
        const conversationId: string = generateRandomString(1, 32);

        try {
            await program.methods
                .createConversation(conversationId, chatters)
                .accounts({ authority: payer.publicKey })
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
            anchor.web3.Keypair.generate().publicKey,
            anchor.web3.Keypair.generate().publicKey,
            anchor.web3.Keypair.generate().publicKey,
            anchor.web3.Keypair.generate().publicKey,
        ];
        const conversationId: string = generateRandomString(1, 32);

        try {
            await program.methods
                .createConversation(conversationId, chatters)
                .accounts({ authority: payer.publicKey })
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
        const chatters = [anchor.web3.Keypair.generate().publicKey, anchor.web3.Keypair.generate().publicKey];
        const conversationId: string = generateRandomString(1, 32);

        try {
            await program.methods
                .createConversation(conversationId, chatters)
                .accounts({ authority: payer.publicKey })
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
            await program.methods
                .createConversation(conversationId, chatters)
                .accounts({ authority: payer.publicKey })
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
        const repeatedChatterKeypair = anchor.web3.Keypair.generate();
        const chatters = [payer.publicKey, repeatedChatterKeypair.publicKey, repeatedChatterKeypair.publicKey];
        const conversationId: string = generateRandomString(1, 32);

        try {
            await program.methods
                .createConversation(conversationId, chatters)
                .accounts({ authority: payer.publicKey })
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
        const anotherChatterKeypair = anchor.web3.Keypair.generate();
        const chatters = [payer.publicKey, anotherChatterKeypair.publicKey];
        const conversationId: string = generateRandomString(33, 40);
        const [conversationPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(conversationId).subarray(0, 32)],
            program.programId
        );
        await assert.isRejected(
            program.methods
                .createConversation(conversationId, chatters)
                .accountsPartial({ authority: payer.publicKey, conversationAccount: conversationPda })
                .rpc(),
            /.*/
        );
    });
});
