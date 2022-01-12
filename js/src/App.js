import React, {useEffect, useState} from "react";
import logo from "./logo.svg";
import "./App.css";
import ConnectToPhantom from "./components/ConnectToPhantom.tsx";

const {
  Connection,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
  clusterApiUrl,
} = require("@solana/web3.js");

const BN = require("bn.js");

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [addrList, setAddrList] = useState([]);

  return (
    <div className="App">
      <header className="App-header">
        <ConnectToPhantom />
        {/* {!walletAddress && renderNotConnectedContainer()} */}
        {/* {walletAddress && renderConnectedContainer()} */}
      </header>
    </div>
  );
}

export default App;
