import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  SolletWalletAdapter,
  SolletExtensionWalletAdapter
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton,
  WalletDisconnectButton
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import coinImage from "./coin.png"; // Make sure this path is correct

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

function WalletProviderErrorCallBack(error) {
  console.error("ok");
  console.error(error);
}

export const App = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network })
    ],
    [network]
  );

  const onError = useCallback((error: WalletError) => {
    WalletProviderErrorCallBack(error);
  }, []);

  const [balance, setBalance] = useState(100);
  const [selectedBet, setSelectedBet] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [godMode, setGodMode] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [streak, setStreak] = useState(0);
  const [losingStreak, setLosingStreak] = useState(0);
  const [betHistory, setBetHistory] = useState([]);

  const betOptions = godMode ? [10, 20] : [0.05, 0.1, 0.25, 0.5, 1.0, 2];

  const coinRef = useRef(null);

  const handleFlip = () => {
    if (
      selectedBet === null ||
      selectedOption === null ||
      balance < selectedBet
    ) {
      alert("Please select a valid bet and option, or reload more balance!");
      return;
    }
    setFlipping(true);
    if (coinRef.current) {
      coinRef.current.style.animation = "spin 1s linear infinite";
    }

    setTimeout(() => {
      setFlipping(false);
      const outcome = Math.random() < 0.5 ? "Heads" : "Tails";
      setResult(outcome);
      if (coinRef.current) {
        coinRef.current.style.animation = "none"; // Stop animation
        void coinRef.current.offsetWidth; // Force reflow
      }

      let betOutcome;
      let betAmount;
      if (outcome === selectedOption) {
        setBalance(balance + selectedBet);
        setStreak(streak + 1);
        setLosingStreak(0);
        betOutcome = "Win";
        betAmount = `+${selectedBet}`;
      } else {
        setBalance(balance - selectedBet);
        setStreak(0);
        setLosingStreak(losingStreak + 1);
        betOutcome = "Loss";
        betAmount = `-${selectedBet}`;
      }

      setSelectedBet(null);
      setSelectedOption(null);
      setBetHistory([
        ...betHistory,
        `${selectedOption} (${selectedBet} SOL): ${betOutcome} ${betAmount}`
      ]);
    }, 1000);
  };

  const buttonStyleSelected = {
    ...buttonStyle,
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "black"
  };

  const keyframesStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider onError={onError} wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <div style={containerStyle}>
            <div style={walletStyle}>
              <WalletMultiButton />
              <button style={buttonStyle} onClick={() => setGodMode(!godMode)}>
                God Mode
              </button>
            </div>
            <WalletDisconnectButton />
            <div>
              {betOptions.map((bet) => (
                <button
                  key={bet}
                  style={
                    selectedBet === bet ? buttonStyleSelected : buttonStyle
                  }
                  onClick={() => setSelectedBet(bet)}
                >
                  {bet} SOL
                </button>
              ))}
            </div>
            <div>
              <button
                style={
                  selectedOption === "Heads" ? buttonStyleSelected : buttonStyle
                }
                onClick={() => setSelectedOption("Heads")}
                disabled={selectedBet === null}
              >
                Heads
              </button>
              <button
                style={
                  selectedOption === "Tails" ? buttonStyleSelected : buttonStyle
                }
                onClick={() => setSelectedOption("Tails")}
                disabled={selectedBet === null}
              >
                Tails
              </button>
            </div>
            <div style={{ textAlign: "center" }}>
              <button style={buttonStyle} onClick={handleFlip}>
                Flip
              </button>
            </div>
            <div>
              <img
                ref={coinRef}
                src={coinImage}
                alt="Coin"
                style={{
                  width: "75px",
                  height: "75px"
                }}
              />
              <style>{keyframesStyle}</style>
            </div>
            <div>
              <p>Result: {result}</p>
              <p>Balance: {balance} SOL</p>
              <p>Streak: {streak} Wins</p>
              <p>Losing Streak: {losingStreak} Losses</p>
              <p>Bet History:</p>
              <ul>
                {betHistory.map((bet, index) => (
                  <li key={index}>{bet}</li>
                ))}
              </ul>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const containerStyle = {
  textAlign: "center",
  backgroundColor: "#06AFFF",
  color: "white",
  padding: "20px"
};

const walletStyle = {
  display: "flex",
  justifyContent: "space-between"
};

const buttonStyle = {
  padding: "10px",
  fontSize: "16px",
  margin: "5px",
  cursor: "pointer",
  backgroundColor: "#0077CC",
  color: "white",
  border: "none",
  borderRadius: "5px"
};
