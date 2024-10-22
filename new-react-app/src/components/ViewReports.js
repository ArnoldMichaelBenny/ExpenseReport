import React, { useState, useEffect } from 'react';
import { fetchReportCount, fetchReportDetails } from '../services/contractService';

const ViewReports = () => {
    const [reportId, setReportId] = useState('');
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportCount, setReportCount] = useState(0);
    const [initialLoading, setInitialLoading] = useState(true);

    // Fetch the total number of reports and the latest report details when the component loads
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const count = await fetchReportCount();
                setReportCount(count);

                if (count > 0) {
                    const latestReport = await fetchReportDetails(count - 1);
                    setReport(latestReport);
                }
            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError('Could not retrieve report details. Please try again.');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchReport = async () => {
        if (!reportId || isNaN(reportId)) {
            setError('Please enter a valid Report ID.');
            setReport(null);
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
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2 style={{ textAlign: 'center' }}>View Report</h2>
            {initialLoading ? (
                <p style={{ textAlign: 'center' }}>Loading reports...</p>
            ) : (
                <p style={{ textAlign: 'center' }}>Total Reports Available: {reportCount}</p>
            )}
            <input
                type="text"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                placeholder="Enter Report ID"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <button onClick={fetchReport} disabled={loading} style={{ width: '100%', padding: '10px' }}>
                {loading ? 'Fetching...' : 'Fetch Report'}
            </button>

            {report && (
                <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                    <h3>Report Details:</h3>
                    <p><strong>IPFS Hash:</strong> <a href={`https://ipfs.io/ipfs/${report.ipfsHash}`} target="_blank" rel="noopener noreferrer">{report.ipfsHash}</a></p>
                    <p><strong>Report Hash:</strong> {report.reportHash}</p>
                    <p><strong>Metadata:</strong> {report.metadata}</p>
                    <p><strong>Project ID:</strong> {report.projectId}</p>
                    <p><strong>Submitted By:</strong> {report.reporter}</p>
                    <p><strong>Audited:</strong> {report.audited ? 'Yes' : 'No'}</p>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && report === null && !error && reportCount === 0 && (
                <p style={{ textAlign: 'center' }}>No reports available.</p>
            )}
            {!loading && report === null && !error && (
                <p style={{ textAlign: 'center' }}>Please enter a report ID to view the details.</p>
            )}
        </div>
    );
};

export default ViewReports;
