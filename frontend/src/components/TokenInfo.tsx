import React from "react";
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {
  Connection,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";

const web3 = require("@solana/web3.js");
const solana = new web3.Connection("https://api.devnet.solana.com");
const {PublicKey} = require("@solana/web3.js");

const TokenAMint = new PublicKey(
  "5Yuz7HSDuMu9xX9Gt6yCx8nndDhcwT2K1fWJkTPjdhvG"
);

const toWallet = new PublicKey("5rE973DJcN7h1aEKuUdG2QsLLycYfGM6ty9KCwAaUb4m");
const walletToken = new PublicKey(
  "5KNwMY92xQhCBa523KgHHtQWVKamcx4AEtVHsEqjnsH1"
);
async function call() {
  const acc = await solana.getAccountInfo(walletToken, "confirmed");
  const response = await solana.getParsedTokenAccountsByOwner(toWallet, {
    mint: TokenAMint,
  });

  console.log(response.value[0].account.data.parsed.info.tokenAmount.amount);
  console.log(response);
  // console.log(borsh.deserialize(schema, Test, acc.data));
}
function TokenInfo() {
  call();

  return (
    <div>
      <p>TokenA</p>
      {/* <p>{solana.FAILED_TO_FIND_ACCOUNT}</p> */}
    </div>
  );
}

export default TokenInfo;
