import React, { useState, useEffect } from 'react';
import { fetchReportCount, fetchReportDetails } from '../services/contractService';

const ViewReports = () => {
    const [reportId, setReportId] = useState('');
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportCount, setReportCount] = useState(0);
    const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading

    // Fetch the total number of reports and the latest report details when the component loads
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const count = await fetchReportCount();
                setReportCount(count);

                // If there are reports, fetch the latest one
                if (count > 0) {
                    const latestReport = await fetchReportDetails(count - 1); // Adjust index if necessary
                    setReport(latestReport);
                }
            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError('Could not retrieve report details. Please try again.');
            } finally {
                setInitialLoading(false); // Set loading to false after initial fetch
            }
        };

        fetchInitialData();
    }, []);

    const fetchReport = async () => {
        if (!reportId || isNaN(reportId)) { // Check if the reportId is a valid number
            setError('Please enter a valid Report ID.');
            setReport(null); // Reset report state
            return;
        }

        try {
            setError('');
            setLoading(true);
            const fetchedReport = await fetchReportDetails(reportId);
            setReport(fetchedReport);
        } catch (err) {
            setError('Error fetching report details. Please check the report ID.');
            console.error(err);
            setReport(null); // Reset report state
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>View Report</h2>
            {initialLoading ? ( // Show loading state for initial data fetch
                <p>Loading reports...</p>
            ) : (
                <p>Total Reports Available: {reportCount}</p>
            )}
            <input 
                type="text" 
                value={reportId} 
                onChange={(e) => setReportId(e.target.value)} 
                placeholder="Enter Report ID" 
            />
            <button onClick={fetchReport} disabled={loading}>
                {loading ? 'Fetching...' : 'Fetch Report'}
            </button>

            {report && (
                <div>
                    <h3>Report Details:</h3>
                    <p>IPFS Hash: {report.ipfsHash}</p>
                    <p>Report Hash: {report.reportHash}</p>
                    <p>Metadata: {report.metadata}</p>
                    <p>Project ID: {report.projectId}</p>
                    {/* Add the audited property if it exists */}
                    <p>Audited: {report.audited ? 'Yes' : 'No'}</p>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && report === null && !error && reportCount === 0 && (
                <p>No reports available.</p>
            )}
            {!loading && report === null && !error && (
                <p>Please enter a report ID to view the details.</p>
            )}
        </div>
    );
};

export default ViewReports;
