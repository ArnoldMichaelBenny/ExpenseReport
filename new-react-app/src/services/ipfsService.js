import axios from 'axios';

// Function to upload file to the backend
export const uploadToIPFS = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file); // Use 'file' instead of 'fileContent' to match your server code

        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        if (!backendUrl) {
            throw new Error('Backend URL is not defined. Please check your environment variables.');
        }

        const response = await axios.post(`${backendUrl}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Uploaded to Pinata:', response.data);
        return response.data.IpfsHash; // Assuming the response has IpfsHash
    } catch (error) {
        console.error('Error uploading file to Pinata:', error.message);
        throw error;
    }
};
