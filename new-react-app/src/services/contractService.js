import { ethers } from 'ethers';
import ExpenseReportABI from './ExpenseReportABI.json';

const contractAddress = '0x2acc14f086803697f541e2525e56fd711aac1f48';
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
        await provider.send("eth_requestAccounts", []); // Request wallet accounts
        signer = provider.getSigner();

        // Log contract address for debugging
        console.log('Contract Address:', contractAddress);

        // Initialize the contract
        contract = new ethers.Contract(contractAddress, ExpenseReportABI, signer);
        console.log('Contract initialized successfully:', contract);

        return contract; // Return the contract instance
    } catch (error) {
        handleError('Failed to initialize contract', error);
        throw error; // Rethrow the error to be handled in the component
    }
};


// Function to submit a report
export async function submitReport(ipfsHash, projectId, reportHash, metadata) {
    if (!contract) {
        throw new Error('Contract is not initialized. Please connect your wallet.');
    }

    try {
        // Submit the report to the contract
        const transaction = await contract.submitReport(ipfsHash, projectId, reportHash, metadata);
        await transaction.wait(); // Wait for the transaction to be mined
        console.log('Report submitted successfully:', transaction);
        return transaction; // Return transaction info
    } catch (error) {
        handleError('Error submitting report', error);
    }
}

// Function to fetch report details
export const fetchReportDetails = async (reportId) => {
    try {
        // Ensure the contract is initialized
        if (!contract) {
            throw new Error('Contract is not initialized.');
        }

        // Call the correct function to get report details
        const report = await contract.getReportDetails(reportId);
        return report; // Assuming report is returned as a struct
    } catch (error) {
        handleError('Error fetching report details', error);
        throw error; // Rethrow the error for further handling
    }
};


// Function to fetch the report count
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
