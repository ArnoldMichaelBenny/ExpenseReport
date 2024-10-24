import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ConnectWallet from './components/ConnectWallet';
import FileUpload from './components/FileUpload';
import ViewReports from './components/ViewReports';
import RoleAssignment from './components/RoleAssignment'; // Import the RoleAssignment component
import { initializeContract } from './services/contractService'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [loading, setLoading] = useState(true); 

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
                console.error('Error during contract initialization:', error); // Log the error for debugging
                toast.error('An error occurred during contract initialization.'); 
            } finally {
                setLoading(false); 
            }
        };

        init();
    }, []); 

    return (
        <Router>
            <div className="App">
                <ToastContainer /> 
                <h1>Expense Reporting System</h1>

                <ConnectWallet /> 

                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/upload">Submit Report</Link></li>
                        <li><Link to="/view">View Reports</Link></li>
                        <li><Link to="/role-assignment">Role Assignment</Link></li> {/* New Link for Role Assignment */}
                    </ul>
                </nav>

                {loading ? ( 
                    <div>Loading...</div> // Consider creating a dedicated Loader component
                ) : (
                    <Routes>
                        <Route path="/" element={<div>Welcome to the Expense Reporting System</div>} />
                        <Route path="/upload" element={<FileUpload />} />
                        <Route path="/view" element={<ViewReports />} />
                        <Route path="/role-assignment" element={<RoleAssignment />} /> {/* New Route for Role Assignment */}
                    </Routes>
                )}
            </div>
        </Router>
    );
}

export default App;
