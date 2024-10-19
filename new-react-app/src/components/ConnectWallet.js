import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function ConnectWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);

  useEffect(() => {
    checkWalletConnection();
    const accountsChangedHandler = (accounts) => {
      setConnectedAccount(accounts.length > 0 ? accounts[0] : null);
    };

    window.ethereum?.on('accountsChanged', accountsChangedHandler);

    return () => {
      window.ethereum?.removeListener('accountsChanged', accountsChangedHandler);
    };
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    } else {
      console.error('MetaMask is not installed.');
    }
  };

  const connectWallet = async () => {
    if (isConnecting) {
      console.log('Already processing wallet connection');
      return; // Prevent duplicate requests
    }

    setIsConnecting(true);
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []); // Request accounts
        const accounts = await provider.listAccounts(); // Get connected accounts
        setConnectedAccount(accounts[0] || null); // Update connected account
        console.log('Wallet connected:', accounts[0]);
      } else {
        console.error('MetaMask is not installed. Please install it to connect your wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false); // Reset the flag after the request
    }
  };

  return (
    <div>
      <button onClick={connectWallet} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {connectedAccount && <p>Connected Account: {connectedAccount}</p>}
    </div>
  );
}

export default ConnectWallet;
