const API_URL = 'http://localhost:5000/api';

const api = {
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API Post Error:', error);
            return { success: false, message: 'Server communication error' };
        }
    },

    async get(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error('API Get Error:', error);
            return null;
        }
    },

    async upload(endpoint, formData) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('API Upload Error:', error);
            return { success: false, message: 'Upload error' };
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('API Delete Error:', error);
            return { success: false, message: 'Delete error' };
        }
    }
};
