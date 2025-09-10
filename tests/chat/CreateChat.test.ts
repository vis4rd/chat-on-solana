import { before, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import chaiAsPromised from "chai-as-promised";
import * as IDL from "../../target/types/chat.ts";
import { generateRandomString } from "../utils/Random.ts";
import { assert, use } from "chai";

use(chaiAsPromised);

describe("create_chat instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const payer = provider.wallet as anchor.Wallet;
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;

    const [chatListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("chat_list")],
        program.programId
    );

    before(async () => {
        await program.methods
            .registerUser()
            .accounts({ authority: payer.publicKey })
            .rpc()
            .catch(() => {}); // ignore already-initialized error
    });

    it("creates chat when passed 2-4 chatters", async () => {
        const anotherChatterKeypair = anchor.web3.Keypair.generate();
        const chatters = [payer.publicKey, anotherChatterKeypair.publicKey];
        const chatId: string = generateRandomString(1, 32);
        const seeds = [Buffer.from(chatId)];
        const [chatPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);

        await program.methods.createChat(chatId, chatters).accounts({ authority: payer.publicKey }).rpc();

        const accInfo = await provider.connection.getAccountInfo(chatPda);
        assert.isNotNull(accInfo, "Account not found");
        assert(accInfo.lamports > 0, "Account not found");
        const acc = await program.account.chatAccount.fetch(chatPda);
        assert.equal(acc.authority.toBase58(), payer.publicKey.toBase58());
        assert.equal(acc.chatterCount, chatters.length);
        assert.equal(acc.messages.length, 0);
        assert.deepEqual(acc.chatters, chatters);
    });

    it("rejects with 'NotEnoughChatters' when passed less than 2 chatters", async () => {
        const chatters = [payer.publicKey];
        const chatId: string = generateRandomString(1, 32);
        await assert.isRejected(
            program.methods.createChat(chatId, chatters).accounts({ authority: payer.publicKey }).rpc(),
            /NotEnoughChatters/
        );
    });

    it("rejects with 'TooManyChatters' when passed more than 4 chatters", async () => {
        const chatters = [
            payer.publicKey,
            anchor.web3.Keypair.generate().publicKey,
            anchor.web3.Keypair.generate().publicKey,
            anchor.web3.Keypair.generate().publicKey,
            anchor.web3.Keypair.generate().publicKey,
        ];
        const chatId: string = generateRandomString(1, 32);
        await assert.isRejected(
            program.methods.createChat(chatId, chatters).accounts({ authority: payer.publicKey }).rpc(),
            /TooManyChatters/
        );
    });

    it("rejects with 'PayerNotInChatters' when payer is not in chatters", async () => {
        const chatters = [anchor.web3.Keypair.generate().publicKey, anchor.web3.Keypair.generate().publicKey];
        const chatId: string = generateRandomString(1, 32);
        await assert.isRejected(
            program.methods.createChat(chatId, chatters).accounts({ authority: payer.publicKey }).rpc(),
            /PayerNotInChatters/
        );
    });

    it("rejects with 'ChatAccountIsChatter' when chat account is in chatters", async () => {
        const chatId: string = generateRandomString(1, 32);
        const seeds = [Buffer.from(chatId)];
        const [chatPda] = anchor.web3.PublicKey.findProgramAddressSync(seeds, program.programId);
        const chatters = [chatPda, payer.publicKey];
        await assert.isRejected(
            program.methods.createChat(chatId, chatters).accounts({ authority: payer.publicKey }).rpc(),
            /ChatAccountIsChatter/
        );
    });

    it("rejects with 'RepeatedChatters' when passed repeated chatters", async () => {
        const repeatedChatterKeypair = anchor.web3.Keypair.generate();
        const chatters = [payer.publicKey, repeatedChatterKeypair.publicKey, repeatedChatterKeypair.publicKey];
        const chatId: string = generateRandomString(1, 32);
        await assert.isRejected(
            program.methods.createChat(chatId, chatters).accounts({ authority: payer.publicKey }).rpc(),
            /RepeatedChatters/
        );
    });

    it("rejects when chatId is too long (custom or seed-length error)", async () => {
        const anotherChatterKeypair = anchor.web3.Keypair.generate();
        const chatters = [payer.publicKey, anotherChatterKeypair.publicKey];
        const chatId: string = generateRandomString(33, 40);
        const [chatPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(chatId).subarray(0, 32)],
            program.programId
        );
        await assert.isRejected(
            program.methods
                .createChat(chatId, chatters)
                .accountsPartial({ authority: payer.publicKey, chatAccount: chatPda })
                .rpc(),
            /(ChatIdTooLong|Length of the seed is too long|Could not create program address)/
        );
    });

    describe("chat_list auto-update behavior", () => {
        const baseChatId = "test-chat";
        const secondChatId = "test-chat-2";

        before(async () => {
            await program.methods
                .createChat(baseChatId, [payer.publicKey, anchor.web3.Keypair.generate().publicKey])
                .accounts({ authority: payer.publicKey })
                .rpc()
                .catch(() => {});
        });

        it("chat id added automatically on createChat", async () => {
            const acc = await program.account.chatListAccount.fetch(chatListPDA);
            assert.include(acc.chatIds, baseChatId);
        });

        it("fails when attempting to recreate an existing chat id", async () => {
            await assert.isRejected(
                program.methods
                    .createChat(baseChatId, [payer.publicKey, anchor.web3.Keypair.generate().publicKey])
                    .accounts({ authority: payer.publicKey })
                    .rpc()
            );
        });

        it("adds a different chat id", async () => {
            await program.methods
                .createChat(secondChatId, [payer.publicKey, anchor.web3.Keypair.generate().publicKey])
                .accounts({ authority: payer.publicKey })
                .rpc();
            const acc = await program.account.chatListAccount.fetch(chatListPDA);
            assert.include(acc.chatIds, secondChatId);
            assert.isAtLeast(acc.chatIds.length, 2);
        });

        it("fails to create chat when user not registered (account missing)", async () => {
            const wrongAuthority = anchor.web3.Keypair.generate();
            await assert.isRejected(
                program.methods
                    .createChat("some-chat-wrong", [wrongAuthority.publicKey, anchor.web3.Keypair.generate().publicKey])
                    .accounts({ authority: wrongAuthority.publicKey })
                    .signers([wrongAuthority])
                    .rpc(),
                /(AccountNotInitialized|ConstraintSeeds|InvalidAuthority)/
            );
        });
    });
});
