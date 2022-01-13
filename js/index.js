const {
  Connection,
  clusterApiUrl,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
} = require("@solana/web3.js");
const {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} = require("@solana/spl-token");
const { BN } = require("bn.js");

const mintAuthority = Keypair.fromSecretKey(
  Uint8Array.from([
    44, 152,  71, 225, 202,  62, 208,  47,  99, 134, 230,
   216, 213, 131, 173, 213, 212,  88,  90, 155,  56,  58,
    19, 239, 123, 109, 247,  86, 204,  24, 144,  41, 125,
   186, 203, 180, 161, 170,  86, 140,  91,  88, 166, 154,
   109,  45, 126,  83, 127,  68, 221, 128, 232,  89, 172,
   151,  48,  20,  46, 138, 147, 122, 230,  97
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

const mint1Decimals = 9;
const mint2Decimals = 6;
const fee = 3;

const oraclePubkey = new PublicKey("FBjwZJP63ZB7YfL6xzGErzz6AZxC2pYLzE9HrvnW6kwg");
const oracleProgramId = new PublicKey("5JRoHC688zRpp6siyPRK89DTcZBcFuLxHMj6KMxmPD5t");
const exchangeBoothProgramId = new PublicKey("6716eLivZExNpcPCV8ZPxNXJvYHoKg4eu448vkUAEFU9");

// Connect to cluster
const connection = new Connection(
  clusterApiUrl('devnet'),
  'confirmed',
);

const airDrop = async () => {
  
  console.log("Airdropping mintAuthority 2 SOL...");
  const airdropMintAuthorityTx = await connection.requestAirdrop(mintAuthority.publicKey, 2e9);
  await connection.confirmTransaction(airdropMintAuthorityTx, "finalized");
  console.log("Done");

  console.log("Airdropping admin 2 SOL...");
  const airdropAdminTx = await connection.requestAirdrop(admin.publicKey, 2e9);
  await connection.confirmTransaction(airdropAdminTx, "finalized");
  console.log("Done");

  console.log("Airdropping user 2 SOL...");
  const airdropUserTx = await connection.requestAirdrop(user.publicKey, 2e9);
  await connection.confirmTransaction(airdropUserTx, "finalized");
  console.log("Done");
}

const createOracle = async () => {
  console.log("Creating oracle...");

  // keypair for oracle account
  const echoBuffer = new Keypair();
  console.log("echoBuffer.publicKey:", echoBuffer.publicKey.toBase58());

  // oracle data (u64, u64)
  const tokenAmount1 = 2 * (10 ** mint1Decimals);
  const tokenAmount2 = 3 * (10 ** mint2Decimals);
  const oracleData = Buffer.concat([
    Buffer.from(new Uint8Array( new BN(tokenAmount1).toArray("le", 8) )),
    Buffer.from(new Uint8Array( new BN(tokenAmount2).toArray("le", 8) )),
  ]);

  // instruction data
  const idx = Buffer.from(new Uint8Array([0]));
  const dataLen = Buffer.from(new Uint8Array((new BN(oracleData.length)).toArray("le", 4)));

  let createIx = SystemProgram.createAccount({
    fromPubkey: mintAuthority.publicKey, // mintAuthority arbitrary payer
    newAccountPubkey: echoBuffer.publicKey,
    /** Amount of lamports to transfer to the created account */
    lamports: await connection.getMinimumBalanceForRentExemption(oracleData.length),
    /** Amount of space in bytes to allocate to the created account */
    space: oracleData.length,
    /** Public key of the program to assign as the owner of the created account */
    programId: oracleProgramId,
  });

  let echoIx = new TransactionInstruction({
    keys: [
      {
        pubkey: echoBuffer.publicKey,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: oracleProgramId,
    data: Buffer.concat([idx, dataLen, oracleData]),
  });

  let tx = new Transaction();
  tx.add(createIx).add(echoIx);

  let txid = await sendAndConfirmTransaction(
    connection,
    tx,
    [mintAuthority, echoBuffer], // mintAuthority arbitrary payer
    {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      confirmation: "confirmed",
    }
  );
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

  data = (await connection.getAccountInfo(echoBuffer.publicKey)).data;
  console.log("echoBuffer data:", data);

}

const initTokens = async () => {

  // mint authority
  // const mintAuthority = new Keypair();

  // create admin
  // const admin = new Keypair();

  // create user
  // const user = new Keypair();

  // create/get mints
  console.log("Creating mint1...");
  const mint1 = await Token.createMint(
    connection,
    mintAuthority,
    mintAuthority.publicKey,
    mintAuthority.publicKey,
    mint1Decimals,
    TOKEN_PROGRAM_ID,
  );

  console.log("Creating mint2...");
  const mint2 = await Token.createMint(
    connection,
    mintAuthority,
    mintAuthority.publicKey,
    mintAuthority.publicKey,
    mint2Decimals,
    TOKEN_PROGRAM_ID,
  );

  // create/get admin token accounts
  console.log("Getting/creating admin token accounts...");
  const adminToken1Account = await mint1.getOrCreateAssociatedAccountInfo(
    admin.publicKey,
  );
  const adminToken2Account = await mint2.getOrCreateAssociatedAccountInfo(
    admin.publicKey,
  );

  // create/get user token accounts
  console.log("Getting/creating user token accounts...");
  const userToken1Account = await mint1.getOrCreateAssociatedAccountInfo(
    user.publicKey,
  );
  const userToken2Account = await mint2.getOrCreateAssociatedAccountInfo(
    user.publicKey,
  );

  // mint tokens to admin
  console.log("Minting tokens to admin...");
  await mint1.mintTo(
    adminToken1Account.address,
    mintAuthority.publicKey,
    [],
    5 * (10 ** mint1Decimals),
  )
  await mint2.mintTo(
    adminToken2Account.address,
    mintAuthority.publicKey,
    [],
    5 * (10 ** mint2Decimals),
  )

  // mint token1 to user
  console.log("Minting tokens to user...");
  await mint1.mintTo(
    userToken1Account.address,
    mintAuthority.publicKey,
    [],
    5 * (10 ** mint1Decimals),
  )

  // PDAs
  // exchange booth pda
  console.log("Getting exchange booth PDA...");
  const [exchangeBoothPubkey, exchangeBoothBump] = (await PublicKey.findProgramAddress(
    [Buffer.from("exchange_booth"), admin.publicKey.toBuffer(), mint1.publicKey.toBuffer(), mint2.publicKey.toBuffer()],
    exchangeBoothProgramId
  ));

  // exchange booth token accounts
  console.log("Getting exchange booth token accounts...");
  
  const boothVault1Pubkey = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint1.publicKey,
    exchangeBoothPubkey,
    true,
  );
  const boothVault2Pubkey = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint2.publicKey,
    exchangeBoothPubkey,
    true,
  );

  // const boothVault1Pubkey = await mint1.getOrCreateAssociatedAccountInfo(
  //   exchangeBoothPubkey,
  // );
  // const boothVault2Pubkey = await mint2.getOrCreateAssociatedAccountInfo(
  //   exchangeBoothPubkey,
  // );

  console.log("Creating vault accounts...");
  const initBoothVault1Ix = await Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint1.publicKey,
    boothVault1Pubkey,
    exchangeBoothPubkey,
    // admin.publicKey,
    admin.publicKey,
  );
  const initBoothVault2Ix = await Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint2.publicKey,
    boothVault2Pubkey,
    exchangeBoothPubkey,
    // admin.publicKey,
    admin.publicKey,
  );

  const tx = new Transaction();
  tx.add(initBoothVault1Ix).add(initBoothVault2Ix);

  await sendAndConfirmTransaction(
    connection,
    tx,
    [admin],
    {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      confirmation: "confirmed",
    });

  return {
    connection,
    mint1,
    mint2,
    adminToken1Account,
    adminToken2Account,
    userToken1Account,
    userToken2Account,
    exchangeBoothPubkey,
    boothVault1Pubkey,
    boothVault2Pubkey
  }

}

// init booth

// send tokens to booth

// exchange

const main = async () => {

  // cli arguments
  var args = process.argv.slice(2);
  const action = parseInt(args[0]);
  // const echo = args[1];
  // const price = parseInt(args[2]);

  if (action === 0) {
    await airDrop();
    return;
  }

  if (action === 1) {
    await createOracle();
    return;
  }

  const {
    mint1,
    mint2,
    adminToken1Account,
    adminToken2Account,
    userToken1Account,
    userToken2Account,
    exchangeBoothPubkey,
    boothVault1Pubkey,
    boothVault2Pubkey 
  } = await initTokens();

  // TODO print balances of different tokens for each account

  // Initialize exchange booth
  console.log("Initializing exchange booth...");

  const initIdx = Buffer.from(new Uint8Array([0]));
  const feeBuffer = Buffer.from(new Uint8Array((new BN(fee)).toArray("le", 1)));

  let initIx = new TransactionInstruction({
    keys: [
      {
        pubkey: admin.publicKey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: boothVault1Pubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: boothVault2Pubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: boothVault1Pubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: boothVault2Pubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: exchangeBoothPubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mint1.publicKey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: mint2.publicKey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: oraclePubkey,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: exchangeBoothProgramId,
    data: Buffer.concat([
      initIdx,
      feeBuffer,
    ]),
  });

  let initTx = new Transaction();
  initTx.add(initIx);

  let initTxid = await sendAndConfirmTransaction(
    connection,
    initTx,
    [admin],
    {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      confirmation: "confirmed",
    }
  );
  console.log(`https://explorer.solana.com/tx/${initTxid}?cluster=devnet`);

  data = (await connection.getAccountInfo(exchangeBoothPubkey)).data;
  console.log("Init Buffer Text:", data);

  // Send tokens from admin to vaults
  console.log("Sending tokens from admin to vaults...");

  const transferIdx = Buffer.from(new Uint8Array([3]));
  const transferAmount1 = Buffer.from(new Uint8Array( (new BN(4 * (10 ** mint1Decimals))).toArray("le", 8)) );
  const sendToken1Ix = Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    adminToken1Account.address,
    boothVault1Pubkey,
    admin.publicKey,
    [],
    4 * (10 ** mint1Decimals)
  );

  const transferAmount2 = Buffer.from( new Uint8Array((new BN(4 * (10 ** mint2Decimals))).toArray("le", 8)) );
  const sendToken2Ix = Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    adminToken2Account.address,
    boothVault2Pubkey,
    admin.publicKey,
    [],
    4 * (10 ** mint2Decimals)
  );

  // make the tx
  let sendTx = new Transaction();
  sendTx.add(sendToken1Ix).add(sendToken2Ix);

  // send tx
  let sendTxid = await sendAndConfirmTransaction(
    connection,
    sendTx,
    [admin],
    {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      confirmation: "confirmed",
    }
  );

  // tx url on devnet
  console.log(`https://explorer.solana.com/tx/${sendTxid}?cluster=devnet`);

  // check token accounts
  const adminToken1AccountInfo = (await connection.getParsedTokenAccountsByOwner(admin.publicKey, { mint: mint1.publicKey })).value[0].account.data.parsed.info;
  const adminToken2AccountInfo = (await connection.getParsedTokenAccountsByOwner(admin.publicKey, { mint: mint2.publicKey })).value[0].account.data.parsed.info;
  let vault1AccountInfo = (await connection.getParsedTokenAccountsByOwner(exchangeBoothPubkey, { mint: mint1.publicKey })).value[0].account.data.parsed.info;
  let vault2AccountInfo = (await connection.getParsedTokenAccountsByOwner(exchangeBoothPubkey, { mint: mint2.publicKey })).value[0].account.data.parsed.info;
  // console.log(adminToken1AccountInfo, adminToken2AccountInfo, vault1AccountInfo, vault2AccountInfo);
  console.log("adminToken1Account balance:", adminToken1AccountInfo.tokenAmount.amount);
  console.log("adminToken2ccount balance:", adminToken2AccountInfo.tokenAmount.amount);
  console.log("vault1Account balance:", vault1AccountInfo.tokenAmount.amount);
  console.log("vault2Account balance:", vault2AccountInfo.tokenAmount.amount);


  // Exchange
  console.log("Exchanging token1 for token2...");

  // ix
  const exchangeIdx = Buffer.from(new Uint8Array([3]));
  const swapAmount = Buffer.from( new Uint8Array( (new BN(2 * (10 ** mint1Decimals))).toArray("le", 8) ) );
  let exchangeIx = new TransactionInstruction({
    keys: [
      { pubkey: admin.publicKey, isSigner: false, isWritable: false },
      { pubkey: exchangeBoothPubkey, isSigner: false, isWritable: false },
      { pubkey: boothVault1Pubkey, isSigner: false, isWritable: true },
      { pubkey: boothVault2Pubkey, isSigner: false, isWritable: true },
      { pubkey: user.publicKey, isSigner: true, isWritable: false },
      { pubkey: userToken1Account.address, isSigner: false, isWritable: true },
      { pubkey: userToken2Account.address, isSigner: false, isWritable: true },
      { pubkey: mint1.publicKey, isSigner: false, isWritable: false },
      { pubkey: mint2.publicKey, isSigner: false, isWritable: false },
      { pubkey: oraclePubkey, isSigner: false, isWritable: false },
      { pubkey: adminToken1Account.address, isSigner: false, isWritable: true },
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
      confirmation: "confirmed",
    }
  );

  // tx url on devnet
  console.log(`https://explorer.solana.com/tx/${exchangeTxid}?cluster=devnet`);

  // check balances
  const userToken1AccountInfo = (await connection.getParsedTokenAccountsByOwner(user.publicKey, { mint: mint1.publicKey })).value[0].account.data.parsed.info;
  const userToken2AccountInfo = (await connection.getParsedTokenAccountsByOwner(user.publicKey, { mint: mint2.publicKey })).value[0].account.data.parsed.info;
  vault1AccountInfo = (await connection.getParsedTokenAccountsByOwner(exchangeBoothPubkey, { mint: mint1.publicKey })).value[0].account.data.parsed.info;
  vault2AccountInfo = (await connection.getParsedTokenAccountsByOwner(exchangeBoothPubkey, { mint: mint2.publicKey })).value[0].account.data.parsed.info;
  console.log("userToken1Account balance:", userToken1AccountInfo.tokenAmount.amount);
  console.log("userToken2ccount balance:", userToken2AccountInfo.tokenAmount.amount);
  console.log("vault1Account balance:", vault1AccountInfo.tokenAmount.amount);
  console.log("vault2Account balance:", vault2AccountInfo.tokenAmount.amount);
}

main()
.then(() => {
  console.log("Success");
})
.catch((e) => {
  console.error(e);
});