import { before, describe, it } from "node:test";
import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../../target/types/chat.ts";
import { assert } from "chai";

describe("accept_invite instruction", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;
    const authority = anchor.web3.Keypair.generate();
    const inviter = anchor.web3.Keypair.generate();

    const [inviteListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [authority.publicKey.toBuffer(), Buffer.from("invite_list")],
        program.programId
    );
    const [chatListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [authority.publicKey.toBuffer(), Buffer.from("chat_list")],
        program.programId
    );

    const conversationId = "invite-conv-acc-" + Math.floor(Math.random() * 10000);

    before(async () => {
        const connection = provider.connection;
        for (const kp of [authority, inviter]) {
            const sig = await connection.requestAirdrop(kp.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
            await connection.confirmTransaction(
                { signature: sig, ...(await connection.getLatestBlockhash()) },
                "confirmed"
            );
        }

        await program.methods.registerUser().accounts({ authority: authority.publicKey }).signers([authority]).rpc();
    });

    it("moves conversationId from invites to chats on accept", async () => {
        await program.methods
            .inviteAnotherUser(authority.publicKey, conversationId)
            .accounts({ sender: inviter.publicKey })
            .signers([inviter])
            .rpc();

        // Sanity check: present in invites
        const inv = await program.account.chatListAccount.fetch(inviteListPDA);
        assert.include(inv.chatIds, conversationId);

        await program.methods
            .acceptInvite(conversationId)
            .accounts({ authority: authority.publicKey })
            .signers([authority])
            .rpc();

        const invitesAcc = await program.account.chatListAccount.fetch(inviteListPDA);
        assert.notInclude(invitesAcc.chatIds, conversationId);
        const convAcc = await program.account.chatListAccount.fetch(chatListPDA);
        assert.include(convAcc.chatIds, conversationId);
    });

    it("fails if invite is not present", async () => {
        await assert.isRejected(
            program.methods
                .acceptInvite("missing-id-" + Math.floor(Math.random() * 10000))
                .accounts({ authority: authority.publicKey })
                .signers([authority])
                .rpc(),
            /InviteNotFound/
        );
    });

    it("fails if conversation id already taken in chats", async () => {
        const dupId = "dup-" + Math.floor(Math.random() * 10000);
        await program.methods
            .createChat(dupId, [authority.publicKey, inviter.publicKey])
            .accounts({ authority: authority.publicKey })
            .signers([authority])
            .rpc();
        await program.methods
            .inviteAnotherUser(authority.publicKey, dupId)
            .accounts({ sender: inviter.publicKey })
            .accountsPartial({ recipientsInviteListAccount: inviteListPDA })
            .signers([inviter])
            .rpc();

        await assert.isRejected(
            program.methods
                .acceptInvite(dupId)
                .accounts({
                    authority: authority.publicKey,
                    inviteListAccount: inviteListPDA,
                    chatListAccount: chatListPDA,
                })
                .signers([authority])
                .rpc(),
            /ChatIdTaken/
        );
    });

    it("fails when authority doesn't match PDAs", async () => {
        const wrong = anchor.web3.Keypair.generate();
        await assert.isRejected(
            program.methods
                .acceptInvite("anything")
                .accounts({
                    authority: wrong.publicKey,
                    inviteListAccount: inviteListPDA,
                    chatListAccount: chatListPDA,
                })
                .signers([wrong])
                .rpc(),
            /(InvalidAuthority|ConstraintSeeds)/
        );
    });
});
