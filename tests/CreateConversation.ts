import * as anchor from "@coral-xyz/anchor";
import * as IDL from "../target/types/chat.ts";
import { describe, it } from "node:test";
import { getLogs } from "@solana-developers/helpers";

describe("chat", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Chat as anchor.Program<IDL.Chat>;
  const newConversationAccountKeypair = new anchor.web3.Keypair();

  it("Is initialized!", async () => {
    const tx = await program.methods
      .createConversation([])
      .accounts({
        payer: payer.publicKey,
        conversationAccount: newConversationAccountKeypair.publicKey,
      })
      .signers([newConversationAccountKeypair])
      .rpc();
    // console.log("Your transaction signature", tx);
    const logs = await getLogs(provider.connection, tx);
    console.log("Logs: ", logs);
  });
});
