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

function Swap(walletKey: any, placeHolder: string) {
  const signup = () => {
    console.log("hi");
  };

  const {inputs, handleInputChange, handleSubmit} = useForm(signup);
  const [Bal, setBal] = useState(0);

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
    <div>
      <form id="form" onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col border-4">
          <div className="flex flex-row justify-between text-xs">
            <p>from</p>
            <p>balance: {Bal}</p>
          </div>
          <div className="flex flex-row justify-between">
            <input
              type=""
              name="input-amount"
              placeholder="placeholder"
              onChange={handleInputChange}
              /* value={inputs.search} */
            />
            <p>token: {"name"}</p>
          </div>
        </div>
        <div className="flex flex-col border-4">
          <div className="flex flex-row justify-between text-xs">
            <p>to</p>
            {/* <p>balance: {"value"}</p> */}
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
