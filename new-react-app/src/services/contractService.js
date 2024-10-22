import { ethers } from 'ethers';
import ExpenseReportABI from './ExpenseReportABI.json';

const contractAddress = '0xD4Ba8166AEcd2a61f15d37d557908b52a1871145';
let contract;
let provider;
let signer;

// Utility function to handle errors
const handleError = (context, error) => {
    console.error(`${context}:`, error);
    throw new Error(`${context}: ${error.message}`);
};

// Function to initialize the contract
export const initializeContract = async () => {
    try {
        // Initialize the provider
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();

        // Log contract address for debugging
        console.log('Contract Address:', contractAddress);

        // Initialize the contract
        contract = new ethers.Contract(contractAddress, ExpenseReportABI, signer);
        console.log('Contract initialized successfully:', contract);

        return true; // Success
    } catch (error) {
        console.error('Failed to initialize contract:', error);
        return false; // Failure
    }
};

export async function submitReport(ipfsHash, projectId, reportHash, metadata) {
    if (!contract) {
        throw new Error('Contract is not initialized. Please connect your wallet.');
    }

    try {
        const transaction = await contract.submitReport(ipfsHash, projectId, reportHash, metadata);
        await transaction.wait(); // Wait for the transaction to be mined
        console.log('Report submitted successfully:', transaction);
        return transaction;
    } catch (error) {
        handleError('Error submitting report', error);
    }
}

export async function fetchReportDetails(reportId) {
    if (!contract) {
        throw new Error('Contract is not initialized. Please connect your wallet.');
    }

    try {
        const [reportHash, metadata] = await contract.getExpenseDetails(reportId);
        
        return {
            projectId: reportId, // Assuming reportId is the same as projectId or adjust accordingly
            ipfsHash: metadata, // Adjust this based on your contract logic
            reportHash: reportHash,
            metadata: metadata,
            reporter: "Reported By User", // Add the reporter if available or relevant
        };
    } catch (error) {
        handleError('Error fetching report details', error);
    }
}




export async function fetchReportCount() {
    if (!contract) {
        throw new Error('Contract is not initialized. Please connect your wallet.');
    }

    try {
        const reportCount = await contract.reportCount();
        return reportCount.toNumber(); // Convert BigNumber to regular number
    } catch (error) {
        handleError('Error fetching report count', error);
    }
}
