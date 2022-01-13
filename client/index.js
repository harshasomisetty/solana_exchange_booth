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
})();
