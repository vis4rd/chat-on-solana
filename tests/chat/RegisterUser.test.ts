import { before, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert } from "chai";

describe("register_user instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const payer = anchor.web3.Keypair.generate();
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;

    before(async () => {
        const connection = provider.connection;
        const sig = await connection.requestAirdrop(payer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(
            { signature: sig, ...(await connection.getLatestBlockhash()) },
            "confirmed"
        );
    });

    const [chatListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("chat_list")],
        program.programId
    );
    const [inviteListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("invite_list")],
        program.programId
    );

    it("creates both chat_list and invite_list accounts for the user", async () => {
        await program.methods.registerUser().accounts({ authority: payer.publicKey }).signers([payer]).rpc();

        const chatList = await program.account.chatListAccount.fetch(chatListPDA);
        assert.isArray(chatList.chatIds);
        assert.strictEqual(chatList.chatIds.length, 0);
        assert.strictEqual(chatList.authority.toBase58(), payer.publicKey.toBase58());

        const inviteList = await program.account.chatListAccount.fetch(inviteListPDA);
        assert.isArray(inviteList.chatIds);
        assert.strictEqual(inviteList.chatIds.length, 0);
        assert.strictEqual(inviteList.authority.toBase58(), payer.publicKey.toBase58());
    });

    it("fails when attempting to register the same user twice", async () => {
        await assert.isRejected(
            program.methods.registerUser().accounts({ authority: payer.publicKey }).signers([payer]).rpc(),
            /already in use|Account in use|Allocate: account .* already in use/
        );
    });
});
