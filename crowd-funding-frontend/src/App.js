import './App.css';
import idl from "./idl.json";
import { 
  Connection, 
  PublicKey, 
  clusterApiUrl
} from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils
} from "@project-serum/anchor";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";

window.Buffer = Buffer;
const { SystemProgram } = web3;

const programID = idl?.address
  ? new PublicKey(idl.address) 
  : (() => { throw new Error("Program ID is missing or invalid in idl.json") })();

const network = clusterApiUrl("devnet");
const opts = { preflightCommitment: "processed" };

const App = () => {
  console.log("Program ID:", programID.toString());

  const [walletAddress, setWalletAddress] = useState(null);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana?.isPhantom) {
        console.log("Phantom wallet found!");
        const response = await solana.connect({ onlyIfTrusted: false });
        console.log("Connected with publicKey", response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      } else {
        alert("Solana object not found! Get a Phantom wallet.");
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (solana) {
        const response = await solana.connect();
        console.log("Connected with publicKey", response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const createCampaign = async () => {
    try {
      const provider = getProvider();
      console.log("Provider: ", provider);

    // Ensure Program Initialization is Correct
    if (!idl?.address) {
      throw new Error("Program ID is missing in idl.json");
    }

    const program = new Program(idl, idl.address, provider); // Use idl.address directly
    console.log("Program Object:", program);
    console.log("Program ID:", program.programId?.toString());
    console.log("Wallet PublicKey:", provider.wallet.publicKey?.toString());

    if (!provider.wallet.publicKey) {
      throw new Error("Wallet not connected or publicKey is undefined.");
    }

    // Validate Before PDA Call
    console.log("Finding PDA...");

      const [campaign] = await PublicKey.findProgramAddress(
        [
          utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.rpc.create("Campaign Name", "Campaign Description", {
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });

      console.log("Campaign created with address:", campaign.toString());
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  useEffect(() => {
    const onLoad =  async() => {
      await checkIfWalletIsConnected();
    }; 
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className="App">
      {!walletAddress && <button onClick={connectWallet}>Connect to Wallet</button>}
      {walletAddress && <button onClick={createCampaign}>Create a Campaign</button>}
    </div>
  );
};

export default App;
