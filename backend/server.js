const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Mock Data
const SERVICES_DATA = [
    {id: 5, name: 'WhatsApp API', status: 'Active', responseTime: '250ms', lastChecked: 'Just now'},
    {id: 6, name: 'Swiggy Delivery', status: 'Active', responseTime: '180ms', lastChecked: '3 mins ago'},
    {id: 7, name: 'Telegram Bot', status: 'Active', responseTime: '90ms', lastChecked: '1 min ago'},
];

const DASHBOARD_STATS = {
    totalServices: 3,
    activeServices: 3,
    failedServices: 0,
    avgResponseTime: "173ms"
};

const ANALYTICS_TRENDS = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    traffic: [450, 600, 800, 700, 950, 1100, 1050],
    responseTime: [90, 85, 100, 95, 80, 75, 85],
    errors: [2, 5, 3, 8, 1, 0, 2],
    // Service-specific data
    services: {
        5: { traffic: [300, 320, 350, 330, 400, 450, 420], responseTime: [240, 250, 260, 245, 255, 265, 250] }, // WhatsApp
        6: { traffic: [150, 180, 210, 190, 250, 300, 280], responseTime: [170, 180, 190, 175, 185, 195, 180] }, // Swiggy
        7: { traffic: [80, 90, 110, 100, 130, 150, 140], responseTime: [85, 90, 95, 88, 92, 98, 90] }     // Telegram
    }
};

// Auth API
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    
    // Updated credentials: suba / suba123
    if (email === "suba" && password === "suba123") {
        return res.json({
            success: true, 
            token: "mock-jwt-token", 
            user: { name: "Suba", email: email }
        });
    }
    return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Stats API
app.get('/api/dashboard/stats', (req, res) => {
    console.log('GET /api/dashboard/stats');
    
    // Add randomness for demonstration
    const variance = Math.floor(Math.random() * 5) - 2; 
    const active = Math.max(0, SERVICES_DATA.filter(s => s.status === 'Active').length + variance);
    const failed = SERVICES_DATA.filter(s => s.status === 'Failed').length;
    const avgResponse = SERVICES_DATA.length > 0 
        ? Math.round(SERVICES_DATA.reduce((acc, s) => acc + parseInt(s.responseTime || 0), 0) / SERVICES_DATA.length) + (Math.floor(Math.random() * 20) - 10)
        : 0;

    res.json({
        totalServices: SERVICES_DATA.length,
        activeServices: active,
        failedServices: failed,
        avgResponseTime: `${avgResponse}ms`
    });
});

app.get('/api/services', (req, res) => {
    console.log('GET /api/services');
    res.json(SERVICES_DATA);
});

app.post('/api/services', (req, res) => {
    console.log('POST /api/services');
    const { name, status, responseTime } = req.body;
    const newService = {
        id: Date.now(),
        name,
        status: status || 'Active',
        responseTime: responseTime || '0ms',
        lastChecked: 'Just now'
    };
    SERVICES_DATA.push(newService);
    res.json({ success: true, service: newService });
});

app.delete('/api/services/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`DELETE /api/services/${id}`);
    const index = SERVICES_DATA.findIndex(s => s.id === id);
    if (index !== -1) {
        SERVICES_DATA.splice(index, 1);
        return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: "Service not found" });
});

app.get('/api/analytics/trends', (req, res) => {
    console.log('GET /api/analytics/trends');
    
    // Create copy with randomized values
    const dynamicTrends = {
        ...ANALYTICS_TRENDS,
        traffic: ANALYTICS_TRENDS.traffic.map(v => v + Math.floor(Math.random() * 100) - 50),
        errors: ANALYTICS_TRENDS.errors.map(v => Math.max(0, v + Math.floor(Math.random() * 4) - 2))
    };
    
    res.json(dynamicTrends);
});

// Upload API
const upload = multer({ dest: 'data/' });
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log('POST /api/upload');
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    res.json({ success: true, message: `File ${req.file.originalname} processed` });
});

app.listen(port, () => {
    console.log(`Analytical Platform Backend running at http://localhost:${port}`);
});
