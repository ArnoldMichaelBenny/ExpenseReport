import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ConnectWallet from './components/ConnectWallet';
import FileUpload from './components/FileUpload';
import ViewReports from './components/ViewReports';
import { initializeContract } from './services/contractService'; // Import the initializeContract function
import { ToastContainer, toast } from 'react-toastify'; // Import toast for notifications
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [loading, setLoading] = useState(true); // State for loading indication

    useEffect(() => {
        const init = async () => {
            try {
                const success = await initializeContract();
                if (!success) {
                    toast.error('Failed to initialize contract. Please check your wallet connection.');
                } else {
                    toast.success('Contract initialized successfully!');
                }
            } catch (error) {
                toast.error('An error occurred during contract initialization.');
            } finally {
                setLoading(false); // Set loading to false after initialization attempt
            }
        };

        init();
    }, []); // Empty dependency array to run only once on mount

    return (
        <Router>
            <div className="App">
                <ToastContainer /> {/* Toast notifications */}
                <h1>Expense Reporting System</h1>

                {/* Always show the ConnectWallet button */}
                <ConnectWallet />

                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/upload">Submit Report</Link></li>
                        <li><Link to="/view">View Reports</Link></li>
                    </ul>
                </nav>

                {loading ? ( // Conditional rendering for loading state
                    <div>Loading...</div>
                ) : (
                    <Routes>
                        <Route path="/" element={<div>Welcome to the Expense Reporting System</div>} />
                        <Route path="/upload" element={<FileUpload />} />
                        <Route path="/view" element={<ViewReports />} />
                    </Routes>
                )}
            </div>
        </Router>
    );
}

export default App;
