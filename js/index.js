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
  TOKEN_PROGRAM_ID
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
    1 * (10 ** mint1Decimals),
  )

  // PDAs
  // exchange booth pda
  console.log("Getting exchange booth PDA...");
  console.log("mint1.pubkey", mint1.publicKey.toBase58());
  console.log("mint2.pubkey", mint2.publicKey.toBase58());
  const [exchangeBoothPubkey, exchangeBoothBump] = (await PublicKey.findProgramAddress(
    [Buffer.from("exchange_booth"), admin.publicKey.toBuffer(), mint1.publicKey.toBuffer(), mint2.publicKey.toBuffer()],
    exchangeBoothProgramId
  ));

  // exchange booth token accounts
  console.log("Getting exchange booth token accounts...");
  const boothVault1Pubkey = await mint1.getOrCreateAssociatedAccountInfo(
    exchangeBoothPubkey,
  );
  const boothVault2Pubkey = await mint2.getOrCreateAssociatedAccountInfo(
    exchangeBoothPubkey,
  );

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

  if (action === 10) {
    const adminToken1AccountInfo = (await connection.getParsedTokenAccountsByOwner(admin.publicKey, { mint: mint1.publicKey })).value[0].account.data.parsed.info;
  
    console.log("adminToken1AccountInfo:", adminToken1AccountInfo);
  }

  // TODO print balances of different tokens for each account


  // create tx
  let tx = new Transaction();

  // TODO
  // const initBoothIdx = Buffer.from(new Uint8Array([0]));
  // const transferAmount1 = Buffer.from(new Uint8Array((new BN(3))).toArray("le", 4)));
  // const transferAmount1 = Buffer.from(new Uint8Array((new BN(4 * (10 ** mint1Decimals))).toArray("le", 8)));
  // const initExchangeBoothIx = new TransactionInstruction({
  //   keys: [
  //   ],
  //   programId: exchangeBoothProgramId,
  //   // data: Buffer.concat([idx, Buffer.from(new Uint8Array([2, 0, 0, 0])), Buffer.from(new Uint8Array([buffer_seed])), Buffer.from(new Uint8Array([buffer_size]))]),
  //   data: Buffer.concat([
  //     initBoothIdx
  //   ])
  // });

  // Deposity tokens
  const transferIdx = Buffer.from(new Uint8Array([3]));
  const transferAmount1 = Buffer.from(new Uint8Array((new BN(4 * (10 ** mint1Decimals))).toArray("le", 8)));
  const sendToken1Ix = new TransactionInstruction({
    keys: [
      {
        pubkey: adminToken1Account.publicKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: boothVault1Pubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: admin.publicKey,
        isSigner: true,
        isWritable: false,
      }
    ],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.concat([
      transferIdx,
      transferAmount1
    ])
  });

  const transferAmount2 = Buffer.from(new Uint8Array((new BN(4 * (10 ** mint2Decimals))).toArray("le", 8)));
  const sendToken2Ix = new TransactionInstruction({
    keys: [
      {
        pubkey: adminToken2Account.publicKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: boothVault2Pubkey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: admin.publicKey,
        isSigner: true,
        isWritable: false,
      }
    ],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.concat([
      transferIdx,
      transferAmount2
    ])
  });

  // const exchangeIx = new TransactionInstruction({

  // });

  // form tx
  // tx.add(initExchangeBoothIx).add(sendToken1Ix).add(sendToken2Ix).add(exchangeIx);
  tx.add(sendToken1Ix).add(sendToken2Ix);

  // send tx
  let txid = await sendAndConfirmTransaction(
    connection,
    tx,
    [admin],
    {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      confirmation: "confirmed",
    }
  );

  // tx url on devnet
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

  // get and check data

  // print balances


  const adminToken1AccountInfo = (await connection.getParsedTokenAccountsByOwner(admin.publicKey, { mint: mint1.publicKey })).value[0].account.data.parsed.info;
  const adminToken2AccountInfo = (await connection.getParsedTokenAccountsByOwner(admin.publicKey, { mint: mint2.publicKey })).value[0].account.data.parsed.info;
  const vault1AccountInfo = (await connection.getParsedTokenAccountsByOwner(boothVault1Pubkey, { mint: mint1.publicKey })).value[0].account.data.parsed.info;
  const vault2AccountInfo = (await connection.getParsedTokenAccountsByOwner(boothVault2Pubkey, { mint: mint2.publicKey })).value[0].account.data.parsed.info;
  // const { _, adminToken1AccountInfo } = await connection.getParsedTokenAccountsByOwner(owner, { mint: mint1 });
  console.log(adminToken1AccountInfo, adminToken2AccountInfo, vault1AccountInfo, vault2AccountInfo);
  // console.log(adminToken1AccountInfo);

  // data = (await connection.getAccountInfo(echoBuffer.publicKey)).data;
  // console.log(":", data.toString());


}

main()
.then(() => {
  console.log("Success");
})
.catch((e) => {
  console.error(e);
});