const API_URL = (() => {
    const remoteBackend = window.API_BASE_URL;
    if (remoteBackend && typeof remoteBackend === 'string') {
        const trimmed = remoteBackend.replace(/\/+$/, '');
        return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    }

    const localBackend = 'http://localhost:5000/api';
    const host = window.location.hostname;

    if (host === 'localhost' || host === '127.0.0.1') {
        return localBackend;
    }

    return `${window.location.protocol}//${host}${window.location.port ? `:${window.location.port}` : ''}/api`;
})();

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
