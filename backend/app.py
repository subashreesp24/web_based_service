import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Mock Data
SERVICES_DATA = [
    {"id": 1, "name": "Payment Gateway", "status": "Active", "responseTime": "120ms", "lastChecked": "2 mins ago"},
    {"id": 2, "name": "Auth Service", "status": "Active", "responseTime": "45ms", "lastChecked": "1 min ago"},
    {"id": 3, "name": "Email Provider", "status": "Failed", "responseTime": "N/A", "lastChecked": "5 mins ago"},
    {"id": 4, "name": "Database Cluster", "status": "Active", "responseTime": "12ms", "lastChecked": "Just now"},
]

DASHBOARD_STATS = {
    "totalServices": 24,
    "activeServices": 22,
    "failedServices": 2,
    "avgResponseTime": "85ms"
}

@app.before_request
def log_request_info():
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json(force=True)
        print(f"Login attempt: {data}")
        email = data.get('email')
        password = data.get('password')
        admin_email = os.getenv('ADMIN_EMAIL', 'suba')
        admin_password = os.getenv('ADMIN_PASSWORD', 'suba123')
        jwt_secret = os.getenv('JWT_SECRET', 'mock-jwt-token')
        
        if email == admin_email and password == admin_password:
            return jsonify({"success": True, "token": jwt_secret, "user": {"name": "Admin User", "email": email}})
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"success": False, "message": "Invalid request format"}), 400

@app.route('/api/dashboard/stats', methods=['GET'])
def get_stats():
    return jsonify(DASHBOARD_STATS)

@app.route('/api/services', methods=['GET'])
def get_services():
    return jsonify(SERVICES_DATA)

@app.route('/api/analytics/trends', methods=['GET'])
def get_trends():
    # Mock data for charts
    return jsonify({
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "traffic": [450, 600, 800, 700, 950, 1100, 1050],
        "responseTime": [90, 85, 100, 95, 80, 75, 85],
        "errors": [2, 5, 3, 8, 1, 0, 2]
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"}), 400
    
    # In a real app, we'd process the CSV here
    return jsonify({"success": True, "message": f"File {file.filename} uploaded and processed successfully"})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port)
