import * as web3 from "@solana/web3.js";
import "dotenv/config";
import { airdropIfRequired } from "@solana-developers/helpers";
import LoadSecretKey from "../utils/LoadSecretKey.js";
import GlobalCounterIDL from "../../target/idl/global_counter.json";
import { GlobalCounter } from "../../target/types/global_counter.js";
import { Program } from "@coral-xyz/anchor";

const payer = new LoadSecretKey().fromEnvironmentByteArray("SECRET_KEY");
const connection = new web3.Connection("http://localhost:8899", "confirmed");

const newBalance = await airdropIfRequired(
  connection,
  payer.publicKey,
  1 * web3.LAMPORTS_PER_SOL,
  0.5 * web3.LAMPORTS_PER_SOL
);

// Since it is my program, I can just use an IDL file generated from build.
const program = new Program(GlobalCounterIDL as GlobalCounter, { connection });

console.log(`Program ID: ${program.programId.toBase58()}`);

// Create a transaction
const transaction = new web3.Transaction();

// Here PDA account does not have to be passed as Anchor can infer it from the payer account.
const initialize_instruction = await program.methods
  .initialize()
  .accounts({
    payer: payer.publicKey,
  })
  .instruction();

transaction.add(initialize_instruction);

const signature = await web3.sendAndConfirmTransaction(
  connection,
  transaction,
  [payer]
);

console.log(`✅ Transaction completed! Signature is ${signature}`);
console.log(
  `You can view your transaction on Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`
);

const seeds = [payer.publicKey.toBuffer()];
const [pda, bump] = web3.PublicKey.findProgramAddressSync(
  seeds,
  program.programId
);
const counterAccount = await program.account.counterAccount.fetch(pda);
console.log(`Counter PDA: ${pda}`);
console.log(`PDA account state: ${JSON.stringify(counterAccount)}`);
