import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'process/browser';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ReportProvider } from './context/ReportContext'; // Import your context

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ReportProvider> {/* Wrap App with ReportProvider */}
      <App />
    </ReportProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
