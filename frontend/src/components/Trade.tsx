import React, {useState, useEffect} from "react";
import useForm from "../hooks/swapHook";
import {FaSearch} from "react-icons/fa";
import {Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {
  PublicKey,
  Connection,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";



const web3 = require("@solana/web3.js");
const connection = new web3.Connection("https://api.devnet.solana.com");
const BN = require("bn.js");
const exchange_rate = 2;

const user = Keypair.fromSecretKey(
  Uint8Array.from([
    223,  52, 148,  85,  28, 155, 106,  92,   3,  46, 191,
     36,  31, 102, 121, 244,  67, 157,  21, 194,   8, 143,
     89, 172, 121, 103, 130,  92, 140, 151, 101,  13, 199,
    156, 243, 214, 180, 153, 125,  75, 246, 191, 194,  14,
     48, 220, 100,  94,  67,  68, 134,  91, 108, 117, 213,
     40, 205,  29, 230, 207, 220, 238, 187, 103
  ])
);


const admin = Keypair.fromSecretKey(
  Uint8Array.from([
    67, 178, 131,   5, 148, 247,  12,  32,  93, 104, 184,
   106, 196,  81, 208, 238, 161, 235,  37,  91, 131, 237,
   195,  34, 201,  87, 241, 242,  69, 110, 240,  12, 121,
    11, 139,  79,  21, 111, 118, 110,  29, 214, 200, 167,
   114, 119, 206, 217, 224, 243, 111,  23, 162,  73, 113,
   153, 204, 144,  18,  55, 174, 254, 120,  70
 ])
);

const exchangeBoothProgramId = new PublicKey("6716eLivZExNpcPCV8ZPxNXJvYHoKg4eu448vkUAEFU9");
const exchangeBoothPubkey = new PublicKey("HcPAJwj93k13HQzMJAecaA4eogxdJaCh57SEfgeUF6Rs");
let boothVault1Pubkey;
let boothVault2Pubkey;
const oraclePubkey = new PublicKey("FBjwZJP63ZB7YfL6xzGErzz6AZxC2pYLzE9HrvnW6kwg");
let adminToken1Account;
let adminToken2Account;
const mint1Decimals = 9;
const mint2Decimals = 6;

const mint1Pubkey = new PublicKey("Hq48DzkG3mY8KxEoiM99jkkJaXVsXeXvqU7bmVThN159");
const mint2Pubkey = new PublicKey("3vmnmjcGhiqhdQpUHcrJB1W4TwcfvGzhait39m79udhw");

function Trade(walletKey: any, placeHolder: string) {

  const initTokenAccounts = async (userPubkey) => {

    // find addresses
    console.log("finding user atas...");
    const userToken1AccountPubkey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint1Pubkey,
      userPubkey,
      true,
    );
    const userToken2AccountPubkey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint2Pubkey,
      userPubkey,
      true,
    );

    // create ixs
    const initUserVault1Ix = await Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint1Pubkey,
      userToken1AccountPubkey,
      userPubkey,
      // admin.publicKey,
      userPubkey,
    );
    const initUserVault2Ix = await Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint2Pubkey,
      userToken2AccountPubkey,
      userPubkey,
      // admin.publicKey,
      userPubkey,
    );
  
    console.log("Sending init...");
    const tx = new Transaction();
    tx.add(initUserVault1Ix).add(initUserVault2Ix);
  
    try {
      await sendAndConfirmTransaction(
        connection,
        tx,
        [user],
        {
          skipPreflight: true,
          preflightCommitment: "confirmed",
          // confirmation: "confirmed",
        });

    } catch (err) {
      console.log("Already initialized");
    }

    return {
      userToken1AccountPubkey,
      userToken2AccountPubkey,
    }
  }

  const trade = async () => {
    const input_amount = inputs["input_amount"];

    // already inited - mints, exchange booth, exchange booth vaults, admin token accounts

    // init - user token accounts

    // get user token keys
    const { userToken1AccountPubkey, userToken2AccountPubkey } = await initTokenAccounts(user.publicKey);

    // exchange tx
    // Exchange
    console.log("Exchanging token1 for token2...");

    // ix
    const exchangeIdx = Buffer.from(new Uint8Array([3]));
    const swapAmount = Buffer.from( new Uint8Array( (new BN(input_amount * (10 ** mint2Decimals))).toArray("le", 8) ) );
    let exchangeIx = new TransactionInstruction({
      keys: [
        { pubkey: exchangeBoothPubkey, isSigner: false, isWritable: false },
        { pubkey: boothVault1Pubkey, isSigner: false, isWritable: true },
        { pubkey: boothVault2Pubkey, isSigner: false, isWritable: true },
        { pubkey: user.publicKey, isSigner: true, isWritable: false },
        { pubkey: userToken2AccountPubkey, isSigner: false, isWritable: true },
        { pubkey: userToken1AccountPubkey, isSigner: false, isWritable: true },
        { pubkey: mint1Pubkey, isSigner: false, isWritable: false },
        { pubkey: mint2Pubkey, isSigner: false, isWritable: false },
        { pubkey: oraclePubkey, isSigner: false, isWritable: false },
        { pubkey: adminToken2Account, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: exchangeBoothProgramId,
      data: Buffer.concat([exchangeIdx, swapAmount]),
    });
    
    // make the tx
    let exchangeTx = new Transaction();
    exchangeTx.add(exchangeIx);

    // send tx
    let exchangeTxid = await sendAndConfirmTransaction(
      connection,
      exchangeTx,
      [user],
      {
        skipPreflight: true,
        preflightCommitment: "confirmed",
        // confirmation: "confirmed",
      }
    );

    // tx url on devnet
    console.log(`https://explorer.solana.com/tx/${exchangeTxid}?cluster=devnet`);

    // check balances
    const userToken1AccountInfo = (await connection.getParsedTokenAccountsByOwner(user.publicKey, { mint: mint1Pubkey })).value[0].account.data.parsed.info;
    const userToken2AccountInfo = (await connection.getParsedTokenAccountsByOwner(user.publicKey, { mint: mint2Pubkey })).value[0].account.data.parsed.info;
    const vault1AccountInfo = (await connection.getParsedTokenAccountsByOwner(exchangeBoothPubkey, { mint: mint1Pubkey })).value[0].account.data.parsed.info;
    const vault2AccountInfo = (await connection.getParsedTokenAccountsByOwner(exchangeBoothPubkey, { mint: mint2Pubkey })).value[0].account.data.parsed.info;
    console.log("userToken1Account balance:", userToken1AccountInfo.tokenAmount.amount);
    console.log("userToken2ccount balance:", userToken2AccountInfo.tokenAmount.amount);
    console.log("vault1Account balance:", vault1AccountInfo.tokenAmount.amount);
    console.log("vault2Account balance:", vault2AccountInfo.tokenAmount.amount);

    call(walletKey);
  };

  const {inputs, handleInputChange, handleSubmit} = useForm(trade);
  const [BalA, setBalA] = useState(1);
  const [BalB, setBalB] = useState(0);

  async function call(walletKey) {
    const response = await connection.getParsedTokenAccountsByOwner(user.publicKey, {
      mint: mint2Pubkey,
    });
    const tokensOwned =
      response.value[0].account.data.parsed.info.tokenAmount.amount;
    const mintInfo = await connection.getParsedAccountInfo(mint1Pubkey);
    const baseValue =
      1 * Math.pow(10, mintInfo.value.data.parsed.info.decimals);
    const finalVal = tokensOwned / baseValue;

    setBalA(finalVal);
    // console.log(borsh.deserialize(schema, Test, acc.data));
  }

  useEffect(() => {
    inputs["input_amount"] = 1;
    
    call(walletKey);
    
    // get pdas
    const getPDAs = async () => {

      boothVault1Pubkey = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint1Pubkey,
        exchangeBoothPubkey,
        true,
      );
      boothVault2Pubkey = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint2Pubkey,
        exchangeBoothPubkey,
        true,
      );

      adminToken1Account = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint1Pubkey,
        admin.publicKey,
        true,
      );
      adminToken2Account = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint2Pubkey,
        admin.publicKey,
        true,
      ); 

    }
    getPDAs();

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
              value={inputs["input_amount"]}
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
              value={exchange_rate * inputs["input_amount"]}
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

export default Trade;
