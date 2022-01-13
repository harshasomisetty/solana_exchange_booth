import React from "react";
import {useEffect, useState} from "react";
import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";

import Swap from "./components/Swap";

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: any;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

function App() {
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );
  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(
    undefined
  );

  /**
   * @description gets Phantom provider, if it exists
   */
  const getProvider = (): PhantomProvider | undefined => {
    if ("solana" in window) {
      // @ts-ignore
      const provider = window.solana as any;
      if (provider.isPhantom) return provider as PhantomProvider;
    }
  };

  /**
   * @description prompts user to connect wallet if it exists
   */
  const connectWallet = async () => {
    // @ts-ignore
    const {solana} = window;

    if (solana) {
      try {
        const response = await solana.connect();
        console.log("wallet account ", response.publicKey.toString());
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  /**
   * @description disconnect Phantom wallet
   */
  const disconnectWallet = async () => {
    // @ts-ignore
    const {solana} = window;

    if (walletKey && solana) {
      await (solana as PhantomProvider).disconnect();
      setWalletKey(undefined);
    }
  };

  // detect phantom provider exists
  useEffect(() => {
    const provider = getProvider();

    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  return (
    <div className="flex flex-row justify-center m-4">
      {!provider && (
        <div className="border">
          <a href="https://phantom.app/">
            <p>No provider found. Install Phantom Browser extension</p>
          </a>
          <Swap />
        </div>
      )}

      {provider && !walletKey && (
        <div>
          <button className="p-14 font-bold border-4" onClick={connectWallet}>
            Connect to Phantom Wallet
          </button>
          <Swap />
        </div>
      )}

      {provider && walletKey && (
        <div>
          <p>Connected account {walletKey}</p>

          <button
            className="p-14 font-bold border-4 m-15"
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
          <Swap />
        </div>
      )}
    </div>
  );
}

export default App;
