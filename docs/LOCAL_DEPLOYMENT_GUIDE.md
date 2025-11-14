# Local Network Deployment Guide

## 🏠 Share on Local Network

### Step 1: Update Server Configuration
```javascript
// In web-ui/server.js, change:
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running at: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Network access: http://YOUR_IP_ADDRESS:${PORT}`);
});
```

### Step 2: Find Your IP Address
```bash
# Windows
ipconfig

# Look for IPv4 Address (e.g., 192.168.1.100)
```

### Step 3: Share Access
- Your colleagues can access: `http://YOUR_IP_ADDRESS:3001`
- Make sure Windows Firewall allows port 3001

### Step 4: Package for Distribution
```bash
# Create a portable package
zip -r bruno-generator-v2.0.0.zip . --exclude node_modules --exclude .git
```

## 📦 Installation Instructions for Others
```bash
# 1. Extract the zip file
# 2. Install Node.js (if not installed)
# 3. Navigate to project folder
npm install
cd web-ui
npm install

# 4. Start the application
npm start
# or
node server.js
```