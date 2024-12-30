import './App.css';
import { useEffect, useState } from "react";

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);

  const checkIfWalletIsConnected = async() => {
    try{
      const { solana } = window;
  
      if(solana) {
        if(solana.isPhantom) {
          console.log("Phantom wallet found!");
          const response = await solana.connect({
            onlyIfTrusted: false
          });
          console.log("Connect wallet with publicKey", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        } else {
          alert("Solana object not found! Get a phantom wallet");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if(solana){
      const response = await solana.connect();
      console.log("Connected with publicKey", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const rendererNotConnectedContainer = () => {
    <button onClick={connectWallet}>Connect to Wallet</button>
  };

  useEffect(() => {
    const onLoad = async() => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return <div className="App">{walletAddress && rendererNotConnectedContainer()}</div>
};

export default App;
