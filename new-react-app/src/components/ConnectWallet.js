import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function ConnectWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkWalletConnection();

    const accountsChangedHandler = (accounts) => {
      setConnectedAccount(accounts.length > 0 ? accounts[0] : null);
      setErrorMessage(''); // Clear error message on account change
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
        setErrorMessage('Failed to check wallet connection.');
      }
    } else {
      console.error('MetaMask is not installed.');
      setErrorMessage('MetaMask is not installed. Please install it to connect your wallet.');
    }
  };

  const connectWallet = async () => {
    if (isConnecting) {
      return; // Prevent duplicate connection attempts
    }

    setIsConnecting(true);
    setErrorMessage(''); // Clear previous error message
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const accounts = await provider.listAccounts();
        setConnectedAccount(accounts[0] || null);
        console.log('Wallet connected:', accounts[0]);
      } else {
        console.error('MetaMask is not installed.');
        setErrorMessage('MetaMask is not installed. Please install it to connect your wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setErrorMessage('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      <button onClick={connectWallet} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {connectedAccount && <p>Connected Account: {connectedAccount}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default ConnectWallet;
