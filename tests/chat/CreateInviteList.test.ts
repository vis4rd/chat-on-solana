import { beforeEach, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert } from "chai";

describe("create_invite_list instruction", () => {
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

    const [inviteListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Buffer.from("invites")],
        program.programId
    );

    it("creates an invite list account for the user", async () => {
        await program.methods.createInviteList().accounts({ authority: payer.publicKey }).signers([payer]).rpc();

        const acc = await program.account.conversationListAccount.fetch(inviteListPDA);
        assert.isArray(acc.conversationIds);
        assert.strictEqual(acc.conversationIds.length, 0);
        assert.strictEqual(acc.authority.toBase58(), payer.publicKey.toBase58());
    });

    it("fails if the account already exists", async () => {
        const payer2 = anchor.web3.Keypair.generate();

        const connection = provider.connection;
        const sig = await connection.requestAirdrop(payer2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(
            { signature: sig, ...(await connection.getLatestBlockhash()) },
            "confirmed"
        );
        await program.methods.createInviteList().accounts({ authority: payer2.publicKey }).signers([payer2]).rpc();

        await assert.isRejected(
            program.methods.createInviteList().accounts({ authority: payer2.publicKey }).signers([payer2]).rpc(),
            /already in use|Account in use/
        );
    });
});
