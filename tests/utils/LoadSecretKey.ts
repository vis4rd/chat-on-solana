import dotenv from "dotenv";
import { Keypair } from "@solana/web3.js";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import bs58 from "bs58";

dotenv.config();

export default class LoadSecretKey {
  public fromEnvironmentByteArray(variable_name: string): Keypair {
    const keypairFromEnv = getKeypairFromEnvironment(variable_name);
    if (keypairFromEnv) {
      return keypairFromEnv;
    } else {
      throw new Error(
        `No keypair found in environment variable ${variable_name}`
      );
    }
  }

  public fromEnvironmentBase58(variable_name: string): Keypair {
    const base58Key = process.env[variable_name];
    if (base58Key) {
      const keyAsBytes = bs58.decode(base58Key);
      return Keypair.fromSecretKey(keyAsBytes);
    } else {
      throw new Error(
        `No keypair found in environment variable ${variable_name}`
      );
    }
  }
}
