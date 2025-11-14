# 🎯 Creating "Get Contract Summary" Collection via Web UI

## 📋 Step-by-Step Instructions

### **Before You Start**
1. ✅ Make sure Web UI is running at: http://localhost:3001/index.html
2. ✅ Open the URL in your browser
3. ✅ You should see the Bruno Collection Generator interface

---

## 🚀 Follow These Steps

### **STEP 1: Collection Information**

**What to enter:**
```
Collection Name: Get Contract Summary
```

**Then click:** `Next Step →`

---

### **STEP 2: API Details**

**What to enter:**

**API URL:**
```
http://ix-aks.alipacn.com/ixat1/wsgateway/contracts/{{contractId}}/summary
```

**HTTP Method:**
```
GET
```

**Request Payload:**
```
Leave empty (it's a GET request)
```

**Then click:** `Next Step →`

---

### **STEP 3: Authentication**

**What to select/enter:**

**Authentication Type:**
```
Basic Auth
```

**Username:**
```
CLIENTUSER
```

**Password:**
```
k$@#0n!51P
```

💡 **Tip:** You can click "👁️ Show" to verify your password

**Then click:** `Next Step →`

---

### **STEP 4: Database Configuration**

#### **Database Connection Details:**

**Database Username:**
```
alipuser
```

**Database Password:**
```
Alip!2023
```

**Database Server:**
```
ix-sqlmi1.9e004d9e1a61.database.windows.net
```

**Database Name:**
```
IXAT1
```

---

#### **Database Queries (Add 5 queries):**

**Query #1: Valid Contract ID**

Click `+ Add Query` button, then fill:

```
Query Name: Valid Contract ID
Endpoint Path: /contract-id
SQL Query: SELECT TOP 1 POL_POLICY_NUM AS VALUE, 'ValidContract' AS [KEY] FROM POLICY.T_POPM_POLICY_MASTER WHERE POL_STATUS_CODE = 'ACTIVE' ORDER BY POL_POLICY_NUM DESC
Description: Fetch valid active contract ID for positive testing
```

---

**Query #2: Term Life Contract**

Click `+ Add Query` button again, then fill:

```
Query Name: Term Life Contract
Endpoint Path: /term-life-contract
SQL Query: SELECT TOP 1 POL_POLICY_NUM AS VALUE, 'TermLifeContract' AS [KEY] FROM POLICY.T_POPM_POLICY_MASTER WHERE POL_PRODUCT_TYPE = 'TERM_LIFE' AND POL_STATUS_CODE = 'ACTIVE' ORDER BY POL_POLICY_NUM DESC
Description: Fetch term life contract for specific testing
```

---

**Query #3: NonExistent Contract**

Click `+ Add Query` button again, then fill:

```
Query Name: NonExistent Contract
Endpoint Path: /nonexistent-contract
SQL Query: SELECT CONCAT('INVALID', CAST(GETDATE() AS VARCHAR(20))) AS VALUE, 'NonExistentContract' AS [KEY]
Description: Generate non-existent contract ID for negative testing
```

---

**Query #4: Verify Integration Success**

Click `+ Add Query` button again, then fill:

```
Query Name: Verify Integration Success
Endpoint Path: /fetch-data
SQL Query: SELECT * FROM INTEGRATION.T_ININ_INTEGRATION WHERE ININ_TRANS_REF_GUID = @transRefGuid AND ININ_TRANS_TYPE = @transType
Description: Verify successful integration record in database
```

---

**Query #5: Verify Failure Record**

Click `+ Add Query` button again, then fill:

```
Query Name: Verify Failure Record
Endpoint Path: /failure-data
SQL Query: SELECT * FROM INTEGRATION.T_INIF_INTEGRATION_FAILURES WHERE INIF_TRANS_REF_GUID = @transRefGuid
Description: Verify failure was recorded in integration failures table
```

---

**Then click:** `Generate Collection →`

---

### **STEP 5: Generate & Download**

1. **Review your configuration** in the preview panel
2. **Click:** `🚀 Generate Collection`
3. **Wait 2-3 seconds** for generation to complete
4. **You'll see success message!**

---

## 📥 Download Your Files

After successful generation, you'll see download buttons:

1. Click `📥 Download Collection JSON` → Saves `Get-Contract-Summary.json`
2. Click `📥 Download app.js` → Saves `app.js`
3. Click `📥 Download package.json` → Saves `package.json`

**OR**

Click `📦 Download All Files (ZIP)` to get everything at once

---

## 🎯 What You'll Get

Your generated collection will include:

### **📁 DataPreparation Folder**
- ✅ Valid Contract ID (fetch active contract)
- ✅ Term Life Contract (fetch specific type)
- ✅ NonExistent Contract (generate invalid ID)
- ✅ Verify Integration Success (check DB after API call)
- ✅ Verify Failure Record (check failure logging)

### **📁 Positive Scenarios Folder**
- ✅ Get Contract Summary - Success (valid contract ID)
- ✅ Get Term Life Contract (specific product type)
- ✅ Verify Integration Success (database verification)

### **📁 Negative Scenarios Folder**
- ✅ Get Contract Summary - Invalid Authentication
- ✅ Get Contract Summary - Non-Existent Contract
- ✅ Verify Failure Recorded (database verification)

---

## 🚀 Next Steps After Generation

### **1. Extract Files**
Create a folder (e.g., `contract-summary-tests`) and place all downloaded files there

### **2. Install Dependencies**
```cmd
cd contract-summary-tests
npm install
```

### **3. Start Database Server**
```cmd
node app.js
```

You should see:
```
🚀 Server running on port 3000
📊 Database: IXAT1
🔗 Health check: http://localhost:3000/health

✅ All endpoints are ready!
```

**Keep this terminal running!**

### **4. Import into Bruno**
1. Open Bruno app
2. Click **"Import Collection"**
3. Select `Get-Contract-Summary.json`
4. Collection appears in Bruno!

### **5. Run Tests**
1. First, run **DataPreparation** folder
   - This fetches contract IDs from database
   - Stores them as environment variables
2. Then run **Positive Scenarios** folder
   - Uses the stored contract IDs
   - Tests successful API calls
3. Finally run **Negative Scenarios** folder
   - Tests error handling

---

## 💡 Pro Tips

### **Tip 1: Format Your SQL**
Before entering SQL queries, you can format them in a SQL editor for clarity

### **Tip 2: Test Database Connection**
Before generating, test your database credentials using SQL Server Management Studio or Azure Data Studio

### **Tip 3: Save Configuration**
After filling the form, you can copy the configuration from Step 5 preview and save it for future use

### **Tip 4: Customize After Generation**
The generated collection is fully editable in Bruno or by editing the JSON file

---

## 🔍 What Each Endpoint Does

### **Data Preparation Endpoints:**
- `/contract-id` → Returns a valid active contract ID
- `/term-life-contract` → Returns a term life policy number
- `/nonexistent-contract` → Generates an invalid contract ID
- `/fetch-data` → Verifies integration record exists
- `/failure-data` → Checks if failure was logged

### **How They Work Together:**
```
1. DataPreparation fetches IDs from database
   ↓
2. Positive scenarios use {{contractId}} variable
   ↓
3. API returns TransRefGUID
   ↓
4. Verify endpoints check database for records
   ↓
5. Negative scenarios test error handling
   ↓
6. Complete test coverage achieved!
```

---

## 🐛 Troubleshooting

### **Issue: "Server not running" error when generating**
**Solution:** The Web UI server needs to be running
```cmd
cd web-ui
node server.js
```

### **Issue: Can't connect to database when running tests**
**Solution:** 
- Verify VPN connection if required
- Check database credentials in `app.js`
- Test connection: `http://localhost:3000/health`

### **Issue: Bruno tests fail with "variable not defined"**
**Solution:** Run DataPreparation folder first to populate environment variables

---

## 📊 Expected Results

### **DataPreparation Tests:**
```
✅ Valid Contract ID - 200 OK
   → contractId = "POL123456"
✅ Term Life Contract - 200 OK
   → termLifeContractId = "POL789012"
✅ NonExistent Contract - 200 OK
   → NonExistentContractId = "INVALID20251103..."
```

### **Positive Scenarios:**
```
✅ Get Contract Summary - Success - 200 OK
   → Returns contract details
   → TransRefGUID stored
✅ Verify Integration Success - 200 OK
   → Database record found
```

### **Negative Scenarios:**
```
❌ Invalid Authentication - 401 Unauthorized
❌ Non-Existent Contract - 404 Not Found or 400 Bad Request
✅ Verify Failure Recorded - 200 OK (failure logged in DB)
```

---

## 🎉 Success Checklist

After completing all steps, you should have:

- ✅ Generated Bruno collection JSON file
- ✅ Database server running on port 3000
- ✅ Collection imported in Bruno
- ✅ All DataPreparation tests passing
- ✅ Environment variables populated
- ✅ Positive scenarios working
- ✅ Negative scenarios working
- ✅ Database verification working

---

## 🔗 Quick Reference

**Web UI:** http://localhost:3001/index.html  
**Database Server:** http://localhost:3000  
**Health Check:** http://localhost:3000/health  
**Sample Endpoint:** http://localhost:3000/contract-id

---

## 📞 Need Help?

- Check [WEB_UI_SETUP.md](../WEB_UI_SETUP.md) for Web UI documentation
- Check [BRUNO_QUICK_START.md](../BRUNO_QUICK_START.md) for Bruno usage
- Check browser console (F12) for Web UI errors
- Check terminal output for server errors

---

**Happy Testing! 🎉**

*Time to generate: 2 minutes*  
*Time to test: 5 minutes*  
*Total automation: Complete!*
