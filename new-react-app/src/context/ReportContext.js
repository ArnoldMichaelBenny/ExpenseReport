import React, { createContext, useState, useMemo, useContext } from 'react';

// Create a context for managing reports
export const ReportContext = createContext();

// Provider component to wrap around the application
export const ReportProvider = ({ children }) => {
    const [reports, setReports] = useState([]); // State to hold reports

    // Function to add a new report
    const addReport = (newReport) => {
        setReports((prevReports) => {
            // Check for duplicate report ID
            if (prevReports.find(report => report.id === newReport.id)) {
                console.error('Report with this ID already exists.');
                return prevReports;
            }
            return [...prevReports, newReport];
        });
    };

    // Function to update an existing report by ID
    const updateReport = (id, updatedReport) => {
        setReports((prevReports) => 
            prevReports.map((report) => (report.id === id ? updatedReport : report))
        );
    };

    // Function to remove a report by ID
    const removeReport = (id) => {
        setReports((prevReports) => prevReports.filter((report) => report.id !== id));
    };

    // Memoized value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        reports,
        addReport,
        updateReport,
        removeReport,
        setReports // Optional: Allow direct updates to reports
    }), [reports]);

    return (
        <ReportContext.Provider value={contextValue}>
            {children}
        </ReportContext.Provider>
    );
};

// Custom hook for easier context access
export const useReportContext = () => {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error('useReportContext must be used within a ReportProvider');
    }
    return context;
};
