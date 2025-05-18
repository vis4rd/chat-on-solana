import LoadSecretKey from "./LoadSecretKey.ts";
import * as web3 from "@solana/web3.js";

const payer = new LoadSecretKey().fromEnvironmentByteArray("NEW_ACCOUNT");
const connection = new web3.Connection("http://localhost:8899", "confirmed");

// 1. Get recent confirmed signatures
const signatures = await connection.getSignaturesForAddress(payer.publicKey);

// 2. Get full transaction details
const txs = await Promise.all(
  signatures
    .slice(0, 4000)
    .map((sig) =>
      connection.getTransaction(sig.signature, { commitment: "confirmed" })
    )
);

console.log(txs);
