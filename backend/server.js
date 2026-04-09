require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Database setup
const dbPath = process.env.SQLITE_DB_PATH || process.env.DATABASE_URL || path.join(__dirname, 'analytics.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        responseTime TEXT DEFAULT '0ms',
        lastChecked TEXT DEFAULT 'Just now'
    )`);

    // Insert mock data if table is empty
    db.get("SELECT COUNT(*) as count FROM services", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO services (name, status, responseTime, lastChecked) VALUES (?, ?, ?, ?)");
            stmt.run('WhatsApp API', 'Active', '250ms', 'Just now');
            stmt.run('Swiggy Delivery', 'Active', '180ms', '3 mins ago');
            stmt.run('Telegram Bot', 'Active', '90ms', '1 min ago');
            stmt.finalize();
        }
    });
});

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
    
    // Updated credentials from environment or defaults
    const adminEmail = process.env.ADMIN_EMAIL || "suba";
    const adminPassword = process.env.ADMIN_PASSWORD || "suba123";
    const jwtSecret = process.env.JWT_SECRET || "mock-jwt-token";
    
    if (email === adminEmail && password === adminPassword) {
        return res.json({
            success: true, 
            token: jwtSecret, 
            user: { name: "Suba", email: email }
        });
    }
    return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Stats API
app.get('/api/dashboard/stats', (req, res) => {
    console.log('GET /api/dashboard/stats');
    
    db.all("SELECT status, responseTime FROM services", (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        
        const total = rows.length;
        const active = rows.filter(s => s.status === 'Active').length;
        const failed = total - active;
        const avgResponse = total > 0 ? Math.round(rows.reduce((acc, s) => acc + parseInt(s.responseTime || 0), 0) / total) : 0;
        
        res.json({
            totalServices: total,
            activeServices: active,
            failedServices: failed,
            avgResponseTime: `${avgResponse}ms`
        });
    });
});

app.get('/api/services', (req, res) => {
    console.log('GET /api/services');
    db.all("SELECT * FROM services", (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/services', (req, res) => {
    console.log('POST /api/services');
    const { name, status, responseTime } = req.body;
    db.run("INSERT INTO services (name, status, responseTime, lastChecked) VALUES (?, ?, ?, ?)", 
           [name, status || 'Active', responseTime || '0ms', 'Just now'], 
           function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ success: true, service: { id: this.lastID, name, status: status || 'Active', responseTime: responseTime || '0ms', lastChecked: 'Just now' } });
    });
});

app.delete('/api/services/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`DELETE /api/services/${id}`);
    db.run("DELETE FROM services WHERE id = ?", id, function(err) {
        if (err) return res.status(500).json({error: err.message});
        if (this.changes > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: "Service not found" });
        }
    });
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
    console.log(`Analytical Platform Backend running on port ${port}`);
});
