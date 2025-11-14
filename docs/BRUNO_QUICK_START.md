# 🚀 Bruno Collection Generator - Quick Start Guide

## ⚡ For QA Teams: Zero Coding Required!

This tool automatically generates complete Bruno API test collections from your inputs. Just provide:
1. API URL & request payload
2. Database queries for test data
3. Authentication details

The tool creates:
- ✅ Complete Bruno collection JSON (Data Prep + Positive + Negative scenarios)
- ✅ Database server (app.js) with all query endpoints
- ✅ Ready-to-import collection file
- ✅ All configuration files

---

## 📋 Prerequisites

**Install Node.js** (if not already installed):
1. Download from: https://nodejs.org/
2. Install the LTS version
3. Verify installation: Open command prompt and run:
   ```cmd
   node --version
   npm --version
   ```

**Install Bruno** (if not already installed):
1. Download from: https://www.usebruno.com/
2. Install and launch Bruno app

---

## 🎯 Usage - Two Simple Options

### **Option 1: Interactive Mode (Recommended for First-Time Users)**

1. **Open Command Prompt** in the PlaywrightMCP folder:
   ```cmd
   cd c:\Users\yash.mahesh.choubey\Desktop\ALIP\PlaywrightMCP
   ```

2. **Run the generator**:
   ```cmd
   node generate-bruno-collection.js
   ```

3. **Follow the prompts**:
   - Choose "Interactive step-by-step"
   - Enter your collection name (e.g., "Get Customer Summary")
   - Provide API URL (e.g., `https://apigee-alip-at-v4.dev.aliphub.com/txlife/v1/transaction`)
   - Choose HTTP method (GET/POST)
   - Paste request payload (JSON format)
   - Choose authentication type
   - Enter database configuration
   - Add database queries one by one

4. **Your collection is ready!**
   Files generated in `bruno-generated/` folder

---

### **Option 2: Quick JSON Mode (For Experienced Users)**

1. **Create a config file** `my-api-config.json`:
   ```json
   {
     "collectionName": "My API Tests",
     "apiUrl": "https://api.example.com/v1/endpoint",
     "httpMethod": "POST",
     "requestPayload": {
       "your": "payload"
     },
     "authType": "basic",
     "basicAuth": {
       "username": "user",
       "password": "pass"
     },
     "dbConfig": {
       "user": "dbuser",
       "password": "dbpass",
       "server": "server.com",
       "database": "mydb"
     },
     "dataQueries": [
       {
         "name": "Get Valid ID",
         "endpoint": "/valid-id",
         "query": "SELECT ID FROM USERS WHERE STATUS='ACTIVE'",
         "description": "Fetch valid user ID"
       }
     ]
   }
   ```

2. **Run with JSON mode**:
   ```cmd
   node generate-bruno-collection.js
   ```
   - Choose "Quick mode (paste complete JSON)"
   - Paste your entire JSON config
   - Done!

---

## 📁 What You Get

After generation, check the `bruno-generated/` folder:

```
bruno-generated/
├── Your-Collection-Name.json    ← Import this into Bruno
├── app.js                       ← Database server
├── package.json                 ← Dependencies
└── BRUNO_SETUP_INSTRUCTIONS.md  ← Setup steps
```

---

## 🎬 How to Use Your Generated Collection

### **Step 1: Start the Database Server**

1. Open command prompt in `bruno-generated/` folder:
   ```cmd
   cd bruno-generated
   ```

2. Install dependencies (first time only):
   ```cmd
   npm install
   ```

3. Start the server:
   ```cmd
   node app.js
   ```
   
   You should see: `Database server running on http://localhost:3000`

   **Keep this terminal window open!**

---

### **Step 2: Import Collection into Bruno**

1. Open **Bruno** application
2. Click **"Import Collection"** or **File → Import Collection**
3. Navigate to `bruno-generated/` folder
4. Select your `Your-Collection-Name.json` file
5. Click **"Import"**

Your collection appears with 3 folders:
- 📁 **DataPreparation** - Fetches test data from database
- 📁 **[API Name] Success** - Positive test scenarios
- 📁 **[API Name] Failure** - Negative test scenarios

---

### **Step 3: Configure Environment (One-Time Setup)**

1. In Bruno, click **"Environments"** (left sidebar)
2. Create new environment or edit existing
3. Add these variables:
   ```
   baseUrl: https://your-api-url.com
   username: YOUR_API_USERNAME
   password: YOUR_API_PASSWORD
   ```
4. Add any custom variables your API needs

---

### **Step 4: Run Your Tests**

**Option A: Run Entire Collection**
1. Right-click collection name
2. Select **"Run Collection"**
3. View results in real-time

**Option B: Run Individual Folders**
1. Right-click **DataPreparation** folder
2. Select **"Run Folder"**
3. Repeat for Success and Failure folders

**Option C: Run Single Test**
1. Click any test request
2. Click **"Send"** button
3. View response

---

## 💡 Real Example: Get Customer Summary

### Input Configuration:
```json
{
  "collectionName": "Get Customer Summary",
  "apiUrl": "https://apigee-alip-at-v4.dev.aliphub.com/txlife/v1/transaction",
  "httpMethod": "POST",
  "authType": "basic",
  "basicAuth": {
    "username": "CLIENTUSER",
    "password": "k$@#0n!51P"
  },
  "dataQueries": [
    {
      "name": "Success Client ID",
      "endpoint": "/client-data",
      "query": "SELECT MAX(CD_CLIENT_ID) AS VALUE FROM CRM.T_CRCD_CLIENT_DETAIL"
    }
  ]
}
```

### Generated Output:
- ✅ Bruno collection with 15+ test cases
- ✅ Database server with `/client-data` endpoint
- ✅ Data preparation tests
- ✅ Success scenarios (200 responses)
- ✅ Failure scenarios (400/500 errors)

---

## 🔍 Folder Structure Explained

### **1. DataPreparation Folder**
- Fetches test data from your database
- Stores values in environment variables
- Example: Get valid client ID → stores as `{{clientId}}`
- These variables are used in subsequent tests

### **2. Success Scenarios Folder**
- Tests with valid data
- Expected: 200 status codes
- Uses data from DataPreparation
- Validates successful API responses

### **3. Failure Scenarios Folder**
- Tests with invalid data
- Expected: 400/500 status codes
- Tests error handling:
  - Invalid authentication
  - Missing required fields
  - Non-existent resources
  - Malformed requests

---

## 🛠️ Customization Tips

### **Modify Request Payload**
Edit the generated Bruno JSON:
1. Open `Your-Collection-Name.json` in text editor
2. Find `"request"` → `"body"` → `"json"`
3. Update payload as needed
4. Save and re-import in Bruno

### **Add More Database Queries**
Edit `app.js`:
1. Copy existing endpoint code
2. Change route name (e.g., `/my-new-query`)
3. Update SQL query
4. Restart server

### **Add Custom Assertions**
In Bruno UI:
1. Open any test request
2. Go to **"Tests"** tab
3. Add JavaScript test code:
   ```javascript
   test("Custom validation", function() {
       let data = res.getBody();
       expect(data.field).to.equal("expected value");
   });
   ```

---

## 📊 Running Tests with Bruno CLI

For CI/CD integration:

```cmd
# Install Bruno CLI globally (one time)
npm install -g @usebruno/cli

# Run entire collection
bru run path/to/collection --env Production

# Run specific folder
bru run path/to/collection/DataPreparation --env Production

# Generate report
bru run path/to/collection --env Production --reporter html --output reports/
```

---

## ❓ Troubleshooting

### **Issue: "Cannot find module 'express'"**
**Solution**: Install dependencies
```cmd
cd bruno-generated
npm install
```

### **Issue: "ECONNREFUSED" when running tests**
**Solution**: Make sure database server is running
```cmd
cd bruno-generated
node app.js
```

### **Issue: Database connection failed**
**Solution**: Check database credentials in `app.js`
- Verify username, password, server, database name
- Check firewall/VPN connection
- Test connection directly using SQL client

### **Issue: "CorrelationID is undefined"**
**Solution**: Run DataPreparation folder first
- This populates environment variables
- Then run Success/Failure scenarios

---

## 📞 Support

**Common Questions:**

**Q: Can I use this for non-insurance APIs?**
A: Yes! Works with any REST API. Just provide your URL and payload.

**Q: Can I add more test scenarios?**
A: Yes! Edit the generated Bruno JSON or add requests in Bruno UI.

**Q: Does this work with GraphQL?**
A: Currently supports REST APIs only (GET, POST, PUT, DELETE).

**Q: Can I use different databases?**
A: Yes! Update database config in `app.js`. Supports SQL Server, MySQL, PostgreSQL.

---

## 🎓 Next Steps

1. ✅ Generate your first collection (use interactive mode)
2. ✅ Import into Bruno and run tests
3. ✅ Customize tests for your specific needs
4. ✅ Integrate with CI/CD pipeline (use Bruno CLI)
5. ✅ Share collections with team members

---

## 📚 Additional Resources

- **Full Documentation**: See `BRUNO_GENERATOR_GUIDE.md`
- **Bruno Documentation**: https://docs.usebruno.com/
- **Example Collections**: Check `examples/` folder
- **Video Tutorial**: [Coming soon]

---

**Happy Testing! 🎉**

*Generated by AI Test Automation System*
*Version 1.0.0*
