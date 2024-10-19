import React, { createContext, useState, useMemo } from 'react';

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
    const [reports, setReports] = useState([]);

    // Function to add a new report
    const addReport = (newReport) => {
        setReports((prevReports) => [...prevReports, newReport]);
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
        setReports // Optional: Keep it if you want to allow direct updates
    }), [reports]);

    return (
        <ReportContext.Provider value={contextValue}>
            {children}
        </ReportContext.Provider>
    );
};
