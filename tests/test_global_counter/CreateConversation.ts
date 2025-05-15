import * as web3 from "@solana/web3.js";
import "dotenv/config";
import { airdropIfRequired } from "@solana-developers/helpers";
import LoadSecretKey from "../utils/LoadSecretKey.js";
import ChatIDL from "../../target/idl/chat.json";
import { Chat as ChatSpec } from "../../target/types/chat.js";
import { Program } from "@coral-xyz/anchor";

const payer = new LoadSecretKey().fromEnvironmentByteArray("NEW_ACCOUNT");
const connection = new web3.Connection("http://localhost:8899", "confirmed");

const newBalance = await airdropIfRequired(
  connection,
  payer.publicKey,
  1 * web3.LAMPORTS_PER_SOL,
  0.5 * web3.LAMPORTS_PER_SOL
);

// Since it is my program, I can just use an IDL file generated from build.
const program = new Program(ChatIDL as ChatSpec, { connection });

// Create a transaction
const transaction = new web3.Transaction();

// Counter account is infered from the payer account using PDA
const create_conversation_instruction = await program.methods
  .createConversation([payer.publicKey])
  .accounts({
    payer: payer.publicKey,
  })
  .instruction();

transaction.add(create_conversation_instruction);

const signature = await web3.sendAndConfirmTransaction(
  connection,
  transaction,
  [payer]
);

console.log(`✅ Transaction completed! Signature is ${signature}`);
console.log(
  `You can view your transaction on Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`
);

// debug logging
// const seeds = [payer.publicKey.toBuffer()];
// const [pda] = web3.PublicKey.findProgramAddressSync(seeds, program.programId);
// const counterAccount = await program.account.counterAccount.fetch(pda);
// console.log(`Counter PDA: ${pda}`);
// console.log(`PDA account state: ${JSON.stringify(counterAccount)}`);
