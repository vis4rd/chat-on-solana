import { before, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert } from "chai";

describe("add_invite_to_someones_list instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;
    const sender = anchor.web3.Keypair.generate();
    const recipient = anchor.web3.Keypair.generate();

    const [recipientsInviteListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [recipient.publicKey.toBuffer(), Buffer.from("invites")],
        program.programId
    );

    const conversationId = "invite-conv-" + Math.floor(Math.random() * 10000);

    before(async () => {
        const connection = provider.connection;
        for (const kp of [recipient, sender]) {
            const sig = await connection.requestAirdrop(kp.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
            await connection.confirmTransaction(
                { signature: sig, ...(await connection.getLatestBlockhash()) },
                "confirmed"
            );
        }
        await program.methods
            .createInviteList()
            .accounts({ authority: recipient.publicKey })
            .signers([recipient])
            .rpc()
            .catch(() => {});
    });

    it("adds an invite to the recipient list", async () => {
        await program.methods
            .addInviteToSomeonesList(recipient.publicKey, conversationId)
            .accounts({ sender: sender.publicKey })
            .signers([sender])
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(recipientsInviteListPDA);
        assert.include(acc.conversationIds, conversationId);
    });

    it("does not allow inviting self", async () => {
        await program.methods
            .createInviteList()
            .accounts({ authority: sender.publicKey })
            .signers([sender])
            .rpc()
            .catch(() => {});

        await assert.isRejected(
            program.methods
                .addInviteToSomeonesList(sender.publicKey, "self-invite-test")
                .accounts({ sender: sender.publicKey })
                .signers([sender])
                .rpc(),
            /(ForbiddenInviteToSelf|ConstraintSeeds)/
        );
    });

    it("fails when recipient invite list is full (50 max)", async () => {
        const recipient2 = anchor.web3.Keypair.generate();
        const connection = provider.connection;
        const sig = await connection.requestAirdrop(recipient2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(
            { signature: sig, ...(await connection.getLatestBlockhash()) },
            "confirmed"
        );
        await program.methods
            .createInviteList()
            .accounts({ authority: recipient2.publicKey })
            .signers([recipient2])
            .rpc();

        for (let j = 0; j < 5; j++) {
            const transaction = new anchor.web3.Transaction();
            for (let i = 0; i < 10; i++) {
                const id = `conv-${i + j * 10}`;
                const ix = await program.methods
                    .addInviteToSomeonesList(recipient2.publicKey, id)
                    .accounts({ sender: sender.publicKey })
                    .signers([sender])
                    .instruction();
                transaction.add(ix);
            }
            await provider.sendAndConfirm(transaction, [sender]);
        }

        await assert.isRejected(
            program.methods
                .addInviteToSomeonesList(recipient2.publicKey, "overflow-51")
                .accounts({ sender: sender.publicKey })
                .signers([sender])
                .rpc(),
            /FullInviteList/
        );
    });
});
