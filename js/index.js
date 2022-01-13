const {
  Connection,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
} = require("@solana/web3.js");

const { 
  Token, TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");

const BN = require("bn.js");


const main = async () => {
  var args = process.argv.slice(2);
  const programId = new PublicKey(args[0]);
  const echo = args[1];
  
  const feePayer = new Keypair();
  const echoBuffer = new Keypair();

  console.log("Requesting Airdrop of 1 SOL...");
  await connection.requestAirdrop(feePayer.publicKey, 2e9);
  console.log("Airdrop received");

  let createIx = SystemProgram.createAccount({
    fromPubkey: feePayer.publicKey,
    newAccountPubkey: echoBuffer.publicKey,
    /** Amount of lamports to transfer to the created account */
    lamports: await connection.getMinimumBalanceForRentExemption(echo.length),
    /** Amount of space in bytes to allocate to the created account */
    space: echo.length,
    /** Public key of the program to assign as the owner of the created account */
    programId: programId,
  });

  const idx = Buffer.from(new Uint8Array([1]));
  const messageLen = Buffer.from(new Uint8Array((new BN(echo.length)).toArray("le", 4)));
  const message = Buffer.from(echo, "ascii");


  let echoIx = new TransactionInstruction({
    keys: [
      {
        pubkey: echoBuffer.publicKey,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: programId,
    // data: Buffer.concat([idx, buffer_seed, buffer_size]),
    data: Buffer.concat([idx, messageLen, message])
  });

  let tx = new Transaction();
  tx.add(createIx).add(echoIx);

  let txid = await sendAndConfirmTransaction(
    connection,
    tx,
    [feePayer, echoBuffer],
    {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      confirmation: "confirmed",
    }
  );
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

  data = (await connection.getAccountInfo(echoBuffer.publicKey)).data;
  console.log("Echo Buffer Text:", data.toString());


};

const init = async () => {

  // Connect to cluster
  const connection = new Connection("https://api.devnet.solana.com/");
  // const connection = new Connection("http://127.0.0.1:8899");
  const mint1Decimals = 9;
  const mint2Decimals = 6;
  const oracle = new PublicKey("FBjwZJP63ZB7YfL6xzGErzz6AZxC2pYLzE9HrvnW6kwg");
  // // mint authority
  // const mintAuthority = new Keypair();

  // // create admin
  // const admin = new Keypair();

  // // create user
  // const user = new Keypair();

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

  // console.log("Requesting Airdrop of 1 SOL...");
  // console.log(mintAuthority.publicKey.toString())
  // var mintAirdrop = await connection.requestAirdrop(mintAuthority.publicKey, 3e9);
  // await connection.confirmTransaction(mintAirdrop, "finalized");
  // console.log("Airdrop received");

  // console.log("Requesting Airdrop of 1 SOL...");
  // var adminAirdrop = await connection.requestAirdrop(admin.publicKey, 2e9);
  // await connection.confirmTransaction(adminAirdrop, "finalized");
  // console.log("Airdrop received");

  // console.log("Requesting Airdrop of 1 SOL...");
  // var userAirdrop = await connection.requestAirdrop(user.publicKey, 2e9);
  // await connection.confirmTransaction(userAirdrop, "finalized")
  // console.log("Airdrop received");



  // create/get mints
  const mint1 = await Token.createMint(
    connection,
    mintAuthority,
    mintAuthority.publicKey,
    mintAuthority.publicKey,
    mint1Decimals,
    TOKEN_PROGRAM_ID,
  );

  const mint2 = await Token.createMint(
    connection,
    mintAuthority,
    mintAuthority.publicKey,
    mintAuthority.publicKey,
    mint2Decimals,
    TOKEN_PROGRAM_ID,
  );

  // create/get admin token accounts
  const adminToken1Account = await mint1.getOrCreateAssociatedAccountInfo(
    admin.publicKey,
  );
  const adminToken2Account = await mint2.getOrCreateAssociatedAccountInfo(
    admin.publicKey,
  );

  // create/get user token accounts
  const userToken1Account = await mint1.getOrCreateAssociatedAccountInfo(
    user.publicKey,
  );
  const userToken2Account = await mint2.getOrCreateAssociatedAccountInfo(
    user.publicKey,
  );

  // mint tokens to admin
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
  await mint1.mintTo(
    userToken1Account.address,
    mintAuthority.publicKey,
    [],
    1 * (10 ** mint1Decimals),
  )

  console.log({
    connection,
    mintAuthority,
    admin,
    user,
    mint1,
    mint2,
    adminToken1Account,
    adminToken2Account,
    userToken1Account,
    userToken2Account,
    oracle
  })

  return {
    connection,
    mintAuthority,
    admin,
    user,
    mint1,
    mint2,
    adminToken1Account,
    adminToken2Account,
    userToken1Account,
    userToken2Account,
    oracle
  }

}

const InitializeEB = async () => {
  console.log('initializeEB');
  var args = process.argv.slice(2);
  const programId = new PublicKey(args[0]);
  console.log(args[0])
  const swap = args[1];
  const fee = 3

  const {
    connection,
    mintAuthority,
    admin, 
    user, 
    mint1,
    mint2,
    adminToken1Account,
    adminToken2Account,
    userToken1Account,
    userToken2Account,
    oracle
   } = await init();


  // create admin
  // const admin = new Keypair();
  console.log("program: ", programId)

  //create accounts
  const [exchange_booth, bump1] = (await PublicKey.findProgramAddress(
    [Buffer.from("exchange_booth"), admin.publicKey.toBuffer(), mint1.publicKey.toBuffer(), mint2.publicKey.toBuffer()],
    programId
  ))
  console.log(mint2)
  const [token_account1, bump2] = (await PublicKey.findProgramAddress(
    [Buffer.from("exchange_booth"), admin.publicKey.toBuffer(), mint1.publicKey.toBuffer(), exchange_booth.toBuffer()],
    programId
  ))
  const [token_account2, bump3] = (await PublicKey.findProgramAddress(
    [Buffer.from("exchange_booth"), admin.publicKey.toBuffer(), mint2.publicKey.toBuffer(), exchange_booth.toBuffer()],
    programId
  ))

  const idx = Buffer.from(new Uint8Array([0]));
  const feeBuffer = Buffer.from(new Uint8Array((new BN(fee)).toArray("le", 4)));
  // const buffer_size = Buffer.from(new Uint8Array((new BN(size)).toArray("le", 8)));
  // const message = Buffer.from(echo, "ascii");
  // const buffer_seed = Buffer.from(new Uint8Array([("authority")]));
  // const buffer_size = Buffer.from(new Uint32Array([]));
  // const authority = new PublicKey("CMeaJjiQeQ57xfPkU5nSoZC78abmeJdsGzAfh2R9QamT");
  // const authority = new Keypair()


  // const [authorized_buffer, bump] = (await PublicKey.findProgramAddress(
  //   [Buffer.from("authority"), authority.publicKey.toBuffer(), buffer_seed],
  //   programId
  // ))
  // console.log(authority.publicKey.toBase58())
  // console.log(authorized_buffer.toBase58())
  // console.log(await SystemProgram.programId.toBase58())


  let exchangeIx = new TransactionInstruction({
    keys: [
      {
        pubkey: admin.publicKey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: token_account1,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: token_account2,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: exchange_booth,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: mint1,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: mint2,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: oracle,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.publicKey,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: programId,
    data: Buffer.concat([
      idx,
      feeBuffer,
    ]),
    //data: Buffer.concat([idx, messageLen, message])
  });

  let tx = new Transaction();
  tx.add(exchangeIx);

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
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

  data = (await connection.getAccountInfo(exchange_booth)).data;
  console.log("Init Buffer Text:", data);

  // Authorized Echo
  // const idx2 = Buffer.from(new Uint8Array([2]));
  // const msgLen = Buffer.from(new Uint8Array((new BN(echo.length)).toArray("le", 4)));

  // let AuthEcho = new TransactionInstruction({
  //   keys: [
  //     {
  //       pubkey: authorized_buffer,
  //       isSigner: false,
  //       isWritable: true,
  //     },
  //     {
  //       pubkey: authority.publicKey,
  //       isSigner: true,
  //       isWritable: false,
  //     },
  //   ],
  //   programId: programId,
  //   data: Buffer.concat([
  //     idx2,
  //     msgLen,
  //     message
  //   ]),
  //   //data: Buffer.concat([idx, messageLen, message])
  // });

  // let tx2 = new Transaction();
  // tx2.add(AuthEcho);
  // let fail = new Keypair();
  // let txid2 = await sendAndConfirmTransaction(
  //   connection,
  //   tx2,
  //   [authority],
  //   {
  //     skipPreflight: true,
  //     preflightCommitment: "confirmed",
  //     confirmation: "confirmed",
  //   }
  // );
  // data2 = (await connection.getAccountInfo(authorized_buffer)).data;
  // console.log("Init Buffer Text:", data2);

}

// main()
//   .then(() => {
//     console.log("Success");
//   })
//   .catch((e) => {
//     console.error(e);
//   });

  InitializeEB()