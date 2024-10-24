import React, { useState, useEffect } from 'react';
import { fetchReportDetails, fetchReportCount } from '../services/contractService';
import { toast } from 'react-toastify';
import { ethers } from 'ethers'; // Import ethers to handle BigNumber

const ViewReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportCount, setReportCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadReports = async () => {
            setLoading(true);
            try {
                const count = await fetchReportCount();
                setReportCount(count);

                const fetchedReports = [];
                for (let i = 1; i <= count; i++) { // Assuming report IDs start from 1
                    const reportDetails = await fetchReportDetails(i);
                    fetchedReports.push(reportDetails);
                }
                setReports(fetchedReports);
            } catch (error) {
                console.error('Error fetching reports:', error);
                toast.error('Failed to fetch reports. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadReports();
    }, []);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredReports = reports.filter(report => {
        const { projectId, ipfsHash, metadata } = report;

        // Check if the search query matches projectId or other details
        return (
            projectId.toString() === searchQuery ||  // Match exact project ID
            ipfsHash.includes(searchQuery) ||       // Match IPFS hash
            metadata.toLowerCase().includes(searchQuery.toLowerCase()) // Match metadata
        );
    });

    const renderReports = () => {
        if (filteredReports.length === 0) {
            return <p>No reports found matching the search criteria.</p>; // Message when no reports match the search
        }

        return filteredReports.map((report, index) => (
            <div key={index} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <h3>Report {report.projectId.toString()}</h3> {/* Display report ID */}
                <p>
                    <strong>IPFS Hash:</strong> 
                    <a href={`https://ipfs.io/ipfs/${report.ipfsHash}`} target="_blank" rel="noopener noreferrer">{report.ipfsHash}</a>
                </p>
                <p><strong>Project ID:</strong> {ethers.utils.formatUnits(report.projectId, 0)}</p> {/* Display Project ID */}
                <p><strong>Metadata:</strong> {report.metadata}</p>
                {/* Add other report details here */}
            </div>
        ));
    };

    return (
        <div>
            <h2>View Reports</h2>
            <input
                type="text"
                placeholder="Search Reports by ID, IPFS Hash, or Metadata..."
                value={searchQuery}
                onChange={handleSearch}
                style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
            />
            {loading ? <p>Loading reports...</p> : (
                <>
                    <p>Total Reports: {reportCount}</p>
                    {renderReports()}
                </>
            )}
        </div>
    );
};

export default ViewReports;
