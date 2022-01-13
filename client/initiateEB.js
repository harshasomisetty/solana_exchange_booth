const web3 = require("@solana/web3.js");
const {PublicKey} = require("@solana/web3.js");
const splToken = require("@solana/spl-token");

(async () => {
  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  );

  // Generate a new wallet keypair and airdrop SOL
  var fromWallet = web3.Keypair.generate();
  console.log("public: ", fromWallet.publicKey);
  // console.log("private: ", fromWallet.sec)

  var fromAirdropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    web3.LAMPORTS_PER_SOL
  );
  // Wait for airdrop confirmation
  await connection.confirmTransaction(fromAirdropSignature);

  // Generate a new wallet to receive newly minted token
  // const toWallet = web3.Keypair.generate();

  const toWallet = new PublicKey(
    "5rE973DJcN7h1aEKuUdG2QsLLycYfGM6ty9KCwAaUb4m"
  );

  // Create new token mint
  const mint = await splToken.Token.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    9,
    splToken.TOKEN_PROGRAM_ID
  );

  // Get the token account of the fromWallet Solana address, if it does not exist, create it
  const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  );

  //get the token account of the toWallet Solana address, if it does not exist, create it
  const toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    toWallet
    // toWallet
  );

  // Minting 1 new token to the "fromTokenAccount" account we just returned/created
  await mint.mintTo(
    fromTokenAccount.address,
    fromWallet.publicKey,
    [],
    100 * Math.pow(10, 9)
  );

  // Add token transfer instructions to transaction
  const transaction = new web3.Transaction().add(
    splToken.Token.createTransferInstruction(
      splToken.TOKEN_PROGRAM_ID,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      [],
      1 * Math.pow(10, 9)
    )
  );

  // Sign transaction, broadcast, and confirm
  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet],
    {commitment: "confirmed"}
  );
  console.log("SIGNATURE", signature);
})();
