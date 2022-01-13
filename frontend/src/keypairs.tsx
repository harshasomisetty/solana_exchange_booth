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




export const exchangeBoothPubkey = new PublicKey(
  "7KBbeqMrScuSE9s3QJppS9MLuCYgkdiMRw9B8WEqfXZ2"
);

export const boothVault1PubKey = new PublicKey(
  "2YjxDo23FeZZBKb17z94ysFkpTKwHSEXUEk4QxFDanJ7"
);

export const boothVault2PubKey = new PublicKey(
  "Bu4qWhhf7YuEy1bw8x4QJSUBdX4yr1pAP4E7NyQJ583g"
);

export const tokenAccA = new PublicKey(
  "E7wUuLEcu9as38q3ZYo97K8fmnGuPq5VEjYvKqtbUBPa"
);

export const tokenAccB = new PublicKey(
  "B5VhPpErnW5TmAYvUyNNE4eBUnL48hUULx6TzWhGhqUK"
);

export const mint1 = new PublicKey(
  "HQ4Bya6SCx9tduzzuWccbozEWNCPQZEiN24AxuqD9fPc"
);

export const mint2 = new PublicKey(
  "2C9f9k2heGwPgYvM89cJX165HjG7aMJmRAN8ac8irX1u"
);

export const oraclePubkey = new PublicKey(
  "FBjwZJP63ZB7YfL6xzGErzz6AZxC2pYLzE9HrvnW6kwg"
);

export const adminTokenAccount = new PublicKey(
  "89V5DeiF7Ya6fNSpMiG345vkUjsccuu12Qitjvduvvpd"
);

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export const user = Keypair.fromSecretKey(
  Uint8Array.from([
    223, 52, 148, 85, 28, 155, 106, 92, 3, 46, 191, 36, 31, 102, 121, 244, 67,
    157, 21, 194, 8, 143, 89, 172, 121, 103, 130, 92, 140, 151, 101, 13, 199,
    156, 243, 214, 180, 153, 125, 75, 246, 191, 194, 14, 48, 220, 100, 94, 67,
    68, 134, 91, 108, 117, 213, 40, 205, 29, 230, 207, 220, 238, 187, 103,
  ])
);
