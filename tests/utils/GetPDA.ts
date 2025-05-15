import { PublicKey } from "@solana/web3.js";
import LoadSecretKey from "../utils/LoadSecretKey.js";

const programAddress = new PublicKey(
  "BeuzWNZL6UR4wdLhLHHHDHtu45pH46YVtHabLMznZicf"
);
const payer = new LoadSecretKey().fromEnvironmentByteArray("NEW_ACCOUNT");
const payer2 = new LoadSecretKey().fromEnvironmentByteArray("SECRET_KEY");

const seeds1 = [payer.publicKey.toBuffer(), payer2.publicKey.toBuffer()].sort();
const [pda1, bump1] = PublicKey.findProgramAddressSync(seeds1, programAddress);

console.log(`PDA: ${pda1}`);
console.log(`Bump: ${bump1}`);

const seeds2 = [payer2.publicKey.toBuffer(), payer.publicKey.toBuffer()].sort();
const [pda2, bump2] = PublicKey.findProgramAddressSync(seeds2, programAddress);

console.log(`PDA: ${pda2}`);
console.log(`Bump: ${bump2}`);
