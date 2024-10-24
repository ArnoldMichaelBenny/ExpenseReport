import axios from 'axios';

// Function to upload file to the backend
export const uploadToIPFS = async (file) => {
    try {
        // Create form data to send the file
        const formData = new FormData();
        formData.append('file', file); // Use 'file' to match your server code

        // Retrieve the backend URL from environment variables
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        if (!backendUrl) {
            throw new Error('Backend URL is not defined. Please check your environment variables.');
        }

        // Send the file to the backend
        const response = await axios.post(`${backendUrl}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Log the response for debugging purposes
        console.log('Uploaded to IPFS:', response.data);
        
        // Check if IpfsHash is present in the response
        if (response.data && response.data.IpfsHash) {
            return response.data.IpfsHash; // Assuming the response has IpfsHash
        } else {
            throw new Error('Upload successful, but no IpfsHash returned from the server.');
        }
    } catch (error) {
        console.error('Error uploading file to IPFS:', error.message);
        throw error; // Rethrow the error for further handling in the calling function
    }
};
