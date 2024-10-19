import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { submitReport, fetchReportCount, initializeContract } from '../services/contractService';
import { ethers } from "ethers";
import { toast } from 'react-toastify';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [ipfsHash, setIpfsHash] = useState('');
    const [projectId, setProjectId] = useState('');
    const [metadata, setMetadata] = useState('');
    const [reportHash, setReportHash] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportCount, setReportCount] = useState(0);
    const [contractInitialized, setContractInitialized] = useState(false);

    // Initialize contract and load saved data
    useEffect(() => {
        const initialize = async () => {
            try {
                const initialized = await initializeContract();
                setContractInitialized(initialized);
                if (initialized) {
                    const count = await fetchReportCount();
                    setReportCount(count);
                    localStorage.setItem('reportCount', count);
                } else {
                    console.error('Contract initialization failed.');
                }
            } catch (error) {
                console.error('Error initializing contract:', error);
                toast.error('Failed to initialize contract. Please connect your wallet.');
            }
        };

        const loadSavedData = () => {
            const savedReport = localStorage.getItem('reportDetails');
            const savedCount = localStorage.getItem('reportCount');
            if (savedReport) {
                const { ipfsHash, reportHash, metadata, projectId } = JSON.parse(savedReport);
                setIpfsHash(ipfsHash);
                setReportHash(reportHash);
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
            toast.error('Please fill in all fields');
            return;
        }

        if (!contractInitialized) {
            toast.error('Contract is not initialized. Please connect your wallet.');
            return;
        }

        setLoading(true);
        try {
            const ipfsHash = await uploadFileToIPFS(file, projectId, metadata);
            const reportHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ipfsHash + metadata));
            await submitReport(ipfsHash, projectId, reportHash, metadata);
            const updatedReportCount = await fetchReportCount();

            // Save report details and count to local storage
            localStorage.setItem('reportDetails', JSON.stringify({ ipfsHash, reportHash, metadata, projectId }));
            localStorage.setItem('reportCount', updatedReportCount);
            setReportCount(updatedReportCount);
            toast.success('Report submitted successfully!');
        } catch (error) {
            console.error('Error during submission:', error);
            toast.error(`There was an error during submission: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const uploadFileToIPFS = async (file, projectId, metadata) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
        formData.append('metadata', metadata);

        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data && response.data.IpfsHash) {
            setIpfsHash(response.data.IpfsHash);
            return response.data.IpfsHash;
        } else {
            throw new Error('Invalid response from server');
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} disabled={loading} />
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
            {reportHash && <p>Generated Report Hash: {reportHash}</p>}
            {reportCount > 0 && <p>Total Reports Available: {reportCount}</p>}
        </div>
    );
};

export default FileUpload;
