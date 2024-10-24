import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { submitReport, fetchReportCount, initializeContract } from '../services/contractService';
import { toast } from 'react-toastify';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [ipfsHash, setIpfsHash] = useState('');
    const [projectId, setProjectId] = useState('');
    const [metadata, setMetadata] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportCount, setReportCount] = useState(0);
    const contractRef = useRef(null); // Use a ref for the contract instance

    useEffect(() => {
        const initialize = async () => {
            try {
                const contractInstance = await initializeContract();
                contractRef.current = contractInstance; // Store the contract instance in the ref
                if (contractInstance) {
                    const count = await fetchReportCount(contractInstance);
                    setReportCount(count);
                    localStorage.setItem('reportCount', count);
                } else {
                    toast.error('Contract initialization failed. Please connect your wallet.');
                    console.error('Contract initialization failed.');
                }
            } catch (error) {
                toast.error('Error initializing contract. Please connect your wallet.');
                console.error('Error initializing contract:', error);
            }
        };

        const loadSavedData = () => {
            const savedReport = localStorage.getItem('reportDetails');
            const savedCount = localStorage.getItem('reportCount');
            if (savedReport) {
                const { ipfsHash, metadata, projectId } = JSON.parse(savedReport);
                setIpfsHash(ipfsHash);
                setMetadata(metadata);
                setProjectId(projectId);
            }
            if (savedCount) {
                setReportCount(Number(savedCount));
            }
        };

        loadSavedData();
        initialize();
    }, []);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file || !projectId || !metadata) {
            toast.error('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            // Check if contract is initialized
            if (!contractRef.current) {
                throw new Error('Contract is not initialized. Please connect your wallet.');
            }

            // Upload the file to IPFS and get the CID
            const ipfsHash = await uploadFileToIPFS(file);
            setIpfsHash(ipfsHash); // Set IPFS hash after upload

            // Submit the report with the IPFS hash and metadata
            await submitReport(ipfsHash, projectId, ipfsHash, metadata, contractRef.current);

            // Fetch and update the report count
            const updatedReportCount = await fetchReportCount(contractRef.current);
            setReportCount(updatedReportCount);

            // Save report details and count to local storage
            localStorage.setItem('reportDetails', JSON.stringify({ ipfsHash, metadata, projectId }));
            localStorage.setItem('reportCount', updatedReportCount);

            // Clear the input fields
            resetForm();

            toast.success('Report submitted successfully!');
        } catch (error) {
            console.error('Error during submission:', error);
            toast.error(`Error during submission: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const uploadFileToIPFS = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data && response.data.IpfsHash) {
                return response.data.IpfsHash; // Return IPFS hash
            } else {
                throw new Error('Invalid response from server.');
            }
        } catch (error) {
            console.error('IPFS upload error:', error);
            throw new Error('Error uploading file to IPFS.');
        }
    };

    const resetForm = () => {
        setFile(null);
        setIpfsHash('');
        setProjectId('');
        setMetadata('');
    };

    return (
        <div>
            <input
                type="file"
                onChange={handleFileChange}
                disabled={loading}
            />
            <input
                type="text"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={loading}
            />
            <input
                type="text"
                placeholder="Metadata"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                disabled={loading}
            />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload to IPFS and Submit Report'}
            </button>
            {ipfsHash && <p>IPFS Hash: {ipfsHash}</p>}
            {reportCount > 0 && <p>Total Reports Available: {reportCount}</p>}
        </div>
    );
};

export default FileUpload;
