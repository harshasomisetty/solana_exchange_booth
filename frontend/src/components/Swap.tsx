import React, {useState, useEffect} from "react";
import useForm from "../hooks/swapHook";
import {FaSearch} from "react-icons/fa";
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

import {
  TokenAMint,
  toWallet,
  walletToken,
  exbooth_pog_id,
  user,
} from "../keypairs.tsx";

const web3 = require("@solana/web3.js");
const solana = new web3.Connection("https://api.devnet.solana.com");
const BN = require("bn.js");
const {PublicKey} = require("@solana/web3.js");

function Swap(walletKey: any, placeHolder: string) {
  const signup = async () => {
    const input_amount = inputs["input_amount"];

    const messageLen = Buffer.from(
      new Uint8Array(new BN(input_amount.len).toArray("le", 4))
    );
    const message = Buffer.from(input_amount, "ascii");
    let echoIx = new TransactionInstruction({
      keys: [
        {
          pubkey: user.publicKey,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: exbooth_pog_id,
      data: Buffer.concat([
        Buffer.from(new Uint8Array([3])),
        messageLen,
        message,
      ]),
    });

    let tx = new Transaction();
    tx.add(echoIx);

    let txid = await sendAndConfirmTransaction(solana, tx, [user], {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      commitment: "confirmed",
    });

    console.log(toWallet);
  };

  const {inputs, handleInputChange, handleSubmit} = useForm(signup);
  const [BalA, setBalA] = useState(0);
  const [BalB, setBalB] = useState(0);

  useEffect(() => {
    async function call(walletKey) {
      const acc = await solana.getAccountInfo(walletToken, "confirmed");
      const response = await solana.getParsedTokenAccountsByOwner(toWallet, {
        mint: TokenAMint,
      });
      const tokensOwned =
        response.value[0].account.data.parsed.info.tokenAmount.amount;
      const mintInfo = await solana.getParsedAccountInfo(TokenAMint);
      const baseValue =
        1 * Math.pow(10, mintInfo.value.data.parsed.info.decimals);
      const finalVal = tokensOwned / baseValue;

      setBal(finalVal);
      // console.log(borsh.deserialize(schema, Test, acc.data));
    }
    call(walletKey);
  }, [walletKey]);
  return (
    <div className="">
      <form id="form" onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col border-4">
          <div className="flex flex-row justify-between text-xs">
            <p>from</p>
            <p>balance: {BalA}</p>
          </div>
          <div className="flex flex-row justify-between">
            <input
              type=""
              name="input_amount"
              placeholder="placeholder"
              onChange={handleInputChange}
              /* value={inputs.search} */
            />
            <p>token: {BalB}</p>
          </div>
        </div>
        <div className="flex flex-col border-4">
          <div className="flex flex-row justify-between text-xs">
            <p>to</p>
            <p>balance: {"value"}</p>
          </div>
          <div className="flex flex-row justify-between">
            <input
              type=""
              name="output-amount"
              placeholder="placeholder"
              /* value={inputs.search} */
            />
            <p>token: {"name"}</p>
          </div>
        </div>

        <button type="submit" className="border">
          <p>Swap</p>
        </button>
      </form>
    </div>
  );
}

export default Swap;
