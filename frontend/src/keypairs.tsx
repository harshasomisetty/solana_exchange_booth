import {Keypair} from "@solana/web3.js";
const {PublicKey} = require("@solana/web3.js");

export const TokenAMint = new PublicKey(
  "5Yuz7HSDuMu9xX9Gt6yCx8nndDhcwT2K1fWJkTPjdhvG"
);
export const toWallet = new PublicKey(
  "5rE973DJcN7h1aEKuUdG2QsLLycYfGM6ty9KCwAaUb4m"
);

export const walletToken = new PublicKey(
  "5KNwMY92xQhCBa523KgHHtQWVKamcx4AEtVHsEqjnsH1"
);
export const exbooth_pog_id = new PublicKey(
  "6716eLivZExNpcPCV8ZPxNXJvYHoKg4eu448vkUAEFU9"
);

export const user = Keypair.fromSecretKey(
  Uint8Array.from([
    223, 52, 148, 85, 28, 155, 106, 92, 3, 46, 191, 36, 31, 102, 121, 244, 67,
    157, 21, 194, 8, 143, 89, 172, 121, 103, 130, 92, 140, 151, 101, 13, 199,
    156, 243, 214, 180, 153, 125, 75, 246, 191, 194, 14, 48, 220, 100, 94, 67,
    68, 134, 91, 108, 117, 213, 40, 205, 29, 230, 207, 220, 238, 187, 103,
  ])
);
