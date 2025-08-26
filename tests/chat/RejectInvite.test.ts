import { before, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert } from "chai";

describe("reject_invite instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;
    const authority = anchor.web3.Keypair.generate();
    const inviter = anchor.web3.Keypair.generate();

    const [inviteListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [authority.publicKey.toBuffer(), Buffer.from("invites")],
        program.programId
    );

    const conversationId = "invite-conv-rej-" + Math.floor(Math.random() * 10000);

    before(async () => {
        const connection = provider.connection;
        for (const kp of [authority, inviter]) {
            const sig = await connection.requestAirdrop(kp.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
            await connection.confirmTransaction(
                { signature: sig, ...(await connection.getLatestBlockhash()) },
                "confirmed"
            );
        }

        await program.methods
            .createInviteList()
            .accounts({ authority: authority.publicKey })
            .signers([authority])
            .rpc();

        // Add the invite we'll reject
        await program.methods
            .addInviteToSomeonesList(authority.publicKey, conversationId)
            .accounts({ sender: inviter.publicKey })
            .accountsPartial({ recipientsInviteListAccount: inviteListPDA })
            .signers([inviter])
            .rpc();
    });

    it("removes the invite from the list", async () => {
        await program.methods
            .rejectInvite(conversationId)
            .accounts({ authority: authority.publicKey })
            .signers([authority])
            .rpc();

        const acc = await program.account.conversationListAccount.fetch(inviteListPDA);
        assert.notInclude(acc.conversationIds, conversationId);
    });

    it("no-op when invite not present", async () => {
        await program.methods
            .rejectInvite("missing-" + Math.floor(Math.random() * 10000))
            .accounts({ authority: authority.publicKey })
            .signers([authority])
            .rpc();
    });

    it("fails when authority doesn't match PDA seeds", async () => {
        const wrong = anchor.web3.Keypair.generate();
        await assert.isRejected(
            program.methods
                .rejectInvite("anything")
                .accounts({ authority: wrong.publicKey, inviteListAccount: inviteListPDA })
                .signers([wrong])
                .rpc(),
            /(InvalidAuthority|ConstraintSeeds)/
        );
    });
});
