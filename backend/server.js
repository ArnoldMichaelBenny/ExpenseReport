require('dotenv').config(); // Load environment variables
const fs = require('fs'); // Import fs to work with file streams
const express = require('express');
const fileUpload = require('express-fileupload');
const PinataSDK = require('@pinata/sdk'); // Correct import for Pinata SDK
const FormData = require('form-data'); // Import FormData
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware for file upload
app.use(fileUpload());


const pinata = new PinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});


// Test authentication route
app.get('/test-auth', async (req, res) => {
    try {
        const response = await pinata.testAuthentication();
        res.status(200).json({ message: 'Authentication successful', response });
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed', details: error.message });
    }
});

// Upload route
const { Readable } = require('stream'); // Import Readable from 'stream'

app.post('/upload', async (req, res) => {
    try {
        // Check if any files were uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        // Get the uploaded file
        const uploadedFile = req.files.file;

        // Log the file type and size for debugging
        console.log('Uploaded File Type:', uploadedFile.mimetype);
        console.log('Uploaded File Size:', uploadedFile.size);

        // Create a readable stream from the uploaded file data
        const readableStream = new Readable();
        readableStream._read = () => {}; // No-op _read implementation
        readableStream.push(uploadedFile.data);
        readableStream.push(null);

        // Set up pinataOptions with metadata, including the name
        const pinataOptions = {
            pinataMetadata: {
                name: uploadedFile.name
            },
            pinataOptions: {
                cidVersion: 0
            }
        };

        // Upload to Pinata using pinFileToIPFS
const result = await pinata.pinFileToIPFS(readableStream, pinataOptions);

// Check if the result contains an IpfsHash
if (!result || !result.IpfsHash) {
    throw new Error('Failed to pin file to IPFS');
}

// Return the result
res.status(200).json({ IpfsHash: result.IpfsHash });


    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).json({ error: error.message });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

