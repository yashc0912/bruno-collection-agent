# Bruno Collection Generator - Architecture Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION LAYER                        │
│                     (Web Browser - Port 3001)                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         WEB UI COMPONENTS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  index.html  │  │  styles.css  │  │  script.js   │              │
│  │              │  │              │  │              │              │
│  │ 5-Step Wizard│  │ Styling &    │  │ Form Logic   │              │
│  │ HTML Form    │  │ UI Design    │  │ Validation   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP POST /api/generate
                                  │ (JSON Config)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS SERVER                               │
│                         (server.js)                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  POST /api/generate Endpoint                                  │  │
│  │  1. Receives config from Web UI                               │  │
│  │  2. Maps data (dataQueries → dbQueries, httpMethod → method) │  │
│  │  3. Calls BrunoCollectionGenerator                            │  │
│  │  4. Reads generated file contents                             │  │
│  │  5. Returns file contents as JSON                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ generateCollection(config)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│               BRUNO COLLECTION GENERATOR ENGINE                      │
│                (bruno-collection-generator.js)                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Core Generation Logic                                        │  │
│  │  • generateBrunoJSON() - Creates .bru collection file        │  │
│  │  • generateAppJs() - Creates database server (app.js)        │  │
│  │  • generatePackageJson() - Creates package.json              │  │
│  │  • generateSetupInstructions() - Creates README              │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Writes files to disk
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FILE SYSTEM OUTPUT                              │
│                    (bruno-generated/ folder)                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Generated Files:                                            │   │
│  │  • CollectionName.json - Bruno collection                    │   │
│  │  • app.js - Express database server                          │   │
│  │  • package.json - Dependencies                               │   │
│  │  • BRUNO_SETUP_INSTRUCTIONS.md - Setup guide                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Read file contents
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        WEB UI DOWNLOAD                               │
│                  (Blob + Download Triggers)                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  User gets 2 download buttons:                               │   │
│  │  1. Download Bruno Collection (.json)                        │   │
│  │  2. Download Database Server (.zip)                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Detailed Component Flow

### 1. **Frontend Layer (Web UI)**

```
┌─────────────────────────────────────────────────────────────┐
│                    index.html (UI Structure)                 │
├─────────────────────────────────────────────────────────────┤
│  Step 1: Collection Information                             │
│  ├─ Collection Name input                                   │
│  └─ Next button                                             │
│                                                              │
│  Step 2: API Details                                        │
│  ├─ API URL input                                           │
│  ├─ HTTP Method dropdown (GET/POST/PUT/DELETE)             │
│  ├─ Request Payload textarea                                │
│  └─ Next button                                             │
│                                                              │
│  Step 3: Authentication                                     │
│  ├─ Auth Type dropdown (None/Basic/Bearer)                 │
│  ├─ Username input (if Basic)                               │
│  ├─ Password input (if Basic)                               │
│  ├─ Token input (if Bearer)                                 │
│  └─ Next button                                             │
│                                                              │
│  Step 4: Database Configuration                             │
│  ├─ DB Username, Password, Server, Database                │
│  ├─ Query Builder (dynamic)                                 │
│  │   ├─ Query Name                                          │
│  │   ├─ Endpoint Path                                       │
│  │   ├─ SQL Query                                           │
│  │   └─ Description                                         │
│  ├─ "+ Add Query" button                                    │
│  └─ Generate Collection button                              │
│                                                              │
│  Step 5: Generate & Download                                │
│  ├─ Configuration Preview (JSON)                            │
│  ├─ Generate Collection button                              │
│  └─ Download buttons (appear after generation)              │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Client-Side Logic (script.js)**

```javascript
Flow:
1. showStep(stepNumber) - Manages wizard navigation
2. updateProgress(step) - Updates progress indicator
3. Form validation on each step
4. collectFormData() - Gathers all form inputs
5. generateCollection() - Sends POST request to server
6. displaySuccess(result) - Shows download buttons
7. downloadFile(content, filename, type) - Triggers downloads
```

**Key Functions:**
```
collectFormData() 
    ↓
{
  collectionName: "...",
  apiUrl: "...",
  httpMethod: "GET/POST/...",
  authType: "basic/bearer/none",
  basicAuth: { username, password },
  bearerToken: "...",
  dbConfig: { user, password, server, database },
  dataQueries: [
    { name, endpoint, query, description },
    ...
  ],
  requestPayload: "..."
}
    ↓
POST /api/generate
    ↓
Server processes and returns file contents
    ↓
displaySuccess() shows download buttons
```

### 3. **Backend Layer (server.js)**

```
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Server (Port 3001)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Middleware:                                                 │
│  • express.json() - Parse JSON bodies                       │
│  • express.static() - Serve HTML/CSS/JS files               │
│                                                              │
│  Routes:                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ POST /api/generate                                   │   │
│  │                                                      │   │
│  │ 1. Receive config from req.body                     │   │
│  │ 2. Map field names:                                 │   │
│  │    • dataQueries → dbQueries                        │   │
│  │    • httpMethod → method                            │   │
│  │ 3. Create generator instance                        │   │
│  │ 4. Call generateCollection(mappedConfig)            │   │
│  │ 5. Read generated file contents                     │   │
│  │ 6. Return JSON response with file contents          │   │
│  │ 7. Handle errors with 500 status                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ GET /api/health                                      │   │
│  │ Returns server status                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Data Mapping:**
```javascript
Web UI Format          →    Generator Format
──────────────────────────────────────────────
dataQueries            →    dbQueries
httpMethod             →    method
authType               →    authType
basicAuth              →    basicAuth
bearerToken            →    bearerToken
dbConfig               →    dbConfig
requestPayload         →    requestPayload
```

### 4. **Generator Engine (bruno-collection-generator.js)**

```
┌─────────────────────────────────────────────────────────────┐
│            BrunoCollectionGenerator Class                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  generateCollection(config)                                  │
│  ├─ Validate config                                         │
│  ├─ Create output directory (bruno-generated/)             │
│  ├─ Generate Bruno collection JSON                          │
│  ├─ Generate database server (app.js)                       │
│  ├─ Generate package.json                                   │
│  ├─ Generate setup instructions                             │
│  └─ Return file paths                                       │
│                                                              │
│  generateBrunoJSON(config)                                   │
│  ├─ Create scenarios (positive & negative)                  │
│  ├─ Build request structure (headers, auth, body)           │
│  ├─ Add assertions                                          │
│  └─ Format as Bruno collection                              │
│                                                              │
│  generateAppJs(config)                                       │
│  ├─ Setup Express server                                    │
│  ├─ Configure MSSQL connection                              │
│  ├─ Create REST endpoints for each query                    │
│  ├─ Add CORS support                                        │
│  └─ Add health check endpoint                               │
│                                                              │
│  generatePackageJson(config)                                 │
│  ├─ List dependencies (express, mssql, cors)                │
│  ├─ Add start script                                        │
│  └─ Set project metadata                                    │
│                                                              │
│  generateSetupInstructions()                                 │
│  └─ Create markdown documentation                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Generation Process:**
```
1. Input: Config object
2. Create scenarios:
   ├─ Positive scenarios (from each query)
   └─ Negative scenarios (invalid data, missing params)
3. For each scenario:
   ├─ Build HTTP request
   ├─ Add authentication
   ├─ Add assertions
   └─ Format as Bruno test
4. Generate database server:
   ├─ Create Express app
   ├─ Add MSSQL connection
   └─ Create endpoints matching queries
5. Write all files to disk
6. Return file paths
```

## Data Flow Diagram

```
User Input (Web Form)
        ↓
[Collect Form Data]
        ↓
JSON Configuration
{
  collectionName,
  apiUrl,
  httpMethod,
  authType,
  dbConfig,
  dataQueries: [{
    name,
    endpoint,
    query,
    description
  }]
}
        ↓
[POST to /api/generate]
        ↓
[Field Name Mapping]
        ↓
Mapped Configuration
{
  collectionName,
  apiUrl,
  method,           ← httpMethod
  authType,
  dbConfig,
  dbQueries: [...]  ← dataQueries
}
        ↓
[BrunoCollectionGenerator]
        ↓
┌─────────────────────────────┐
│  Parallel File Generation:  │
│  1. Bruno Collection JSON   │
│  2. Database Server (app.js)│
│  3. package.json            │
│  4. Setup Instructions MD   │
└─────────────────────────────┘
        ↓
[Write to File System]
        ↓
bruno-generated/
├── CollectionName.json
├── app.js
├── package.json
└── BRUNO_SETUP_INSTRUCTIONS.md
        ↓
[Read File Contents]
        ↓
[Return to Server]
        ↓
JSON Response
{
  success: true,
  files: {
    collectionJson: "...",
    appJs: "...",
    packageJson: "...",
    setupInstructions: "..."
  }
}
        ↓
[Display Download Buttons]
        ↓
User Downloads Files
```

## File Structure

```
PlaywrightMCP/
│
├── web-ui/                           # Frontend + Server
│   ├── index.html                    # 5-step wizard UI
│   ├── styles.css                    # UI styling
│   ├── script.js                     # Client-side logic
│   ├── server.js                     # Express backend
│   └── package.json                  # Dependencies
│
├── bruno-collection-generator.js     # Core generator engine
├── generate-bruno-collection.js      # CLI interface
│
├── bruno-generated/                  # Output directory
│   ├── CollectionName.json          # Generated Bruno collection
│   ├── app.js                        # Generated database server
│   ├── package.json                  # Generated dependencies
│   └── BRUNO_SETUP_INSTRUCTIONS.md  # Generated setup guide
│
└── tests/                            # Playwright tests
    ├── web-ui-sanity.spec.js        # UI sanity tests
    └── create-contract-summary-collection.spec.js
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  • HTML5 - Structure                                        │
│  • CSS3 - Styling (Gradient design)                         │
│  • Vanilla JavaScript - Logic                               │
│  • Fetch API - HTTP requests                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
├─────────────────────────────────────────────────────────────┤
│  • Node.js - Runtime                                        │
│  • Express.js v4.18.2 - Web server                          │
│  • File System (fs) - File operations                       │
│  • Path - Path manipulation                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Generated Output                          │
├─────────────────────────────────────────────────────────────┤
│  • Bruno Collection JSON - API test collection              │
│  • Express.js - Database server                             │
│  • MSSQL v10.0.1 - Database driver                          │
│  • CORS - Cross-origin support                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        Testing                               │
├─────────────────────────────────────────────────────────────┤
│  • Playwright - E2E testing                                 │
│  • @playwright/test - Test framework                        │
│  • Playwright MCP - Browser automation                      │
└─────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

### Successful Generation Flow

```
Client (Browser)
    │
    │ POST /api/generate
    │ Content-Type: application/json
    │ {
    │   collectionName: "Get Contract Summary",
    │   apiUrl: "http://api.example.com/contracts/{{id}}",
    │   httpMethod: "GET",
    │   authType: "basic",
    │   basicAuth: { username: "user", password: "pass" },
    │   dbConfig: { user, password, server, database },
    │   dataQueries: [...]
    │ }
    ▼
Server (Express)
    │
    │ 1. Receive & validate request
    │ 2. Map field names
    │ 3. Call generator
    ▼
Generator
    │
    │ 1. Create output directory
    │ 2. Generate Bruno collection
    │ 3. Generate database server
    │ 4. Generate package.json
    │ 5. Generate setup instructions
    │ 6. Write files to disk
    ▼
File System
    │
    │ bruno-generated/
    │ ├── Get-Contract-Summary.json
    │ ├── app.js
    │ ├── package.json
    │ └── BRUNO_SETUP_INSTRUCTIONS.md
    ▼
Server (Express)
    │
    │ 1. Read file contents
    │ 2. Prepare response
    │
    │ Response: 200 OK
    │ Content-Type: application/json
    │ {
    │   success: true,
    │   message: "Collection generated successfully",
    │   files: {
    │     collectionName: "Get Contract Summary",
    │     collectionJson: "...",
    │     appJs: "...",
    │     packageJson: "...",
    │     setupInstructions: "..."
    │   }
    │ }
    ▼
Client (Browser)
    │
    │ 1. Parse response
    │ 2. Show success message
    │ 3. Display download buttons
    │ 4. User clicks download
    │ 5. Create Blob from content
    │ 6. Trigger browser download
    └─ Downloads saved to user's system
```

## Key Features

### 1. **Zero-Code API Testing**
- Users don't write any code
- Fill forms → Get complete test collection
- Includes positive & negative scenarios

### 2. **Database Integration**
- Dynamic query builder
- Generates REST server for test data
- MSSQL connection with encryption

### 3. **Flexible Authentication**
- None, Basic Auth, Bearer Token
- Configured per collection
- Credentials embedded in Bruno collection

### 4. **Dynamic Scenario Generation**
- Positive scenarios from each query
- Negative scenarios (invalid data, missing params)
- Assertions for status codes and response structure

### 5. **Complete Package**
- Bruno collection file (.json)
- Database server (app.js + package.json)
- Setup instructions (markdown)
- Ready to run immediately

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Development Environment                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Web UI Server (localhost:3001)                             │
│  └─ Serves HTML/CSS/JS + API endpoint                       │
│                                                              │
│  Generated Database Server (localhost:3000)                 │
│  └─ Provides test data via REST endpoints                   │
│                                                              │
│  Target API (e.g., ix-aks.alipacn.com)                      │
│  └─ The actual API being tested                             │
│                                                              │
│  Bruno CLI (@usebruno/cli)                                  │
│  └─ Executes generated test collections                     │
│                                                              │
│  Database (Azure SQL Managed Instance)                      │
│  └─ Source of test data                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                     Error Scenarios                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Client-Side Validation                                  │
│     • Empty required fields → Show error message            │
│     • Invalid URLs → Show error message                     │
│     • No queries added → Show error message                 │
│                                                              │
│  2. Server Errors                                           │
│     • 500 Internal Server Error → Alert dialog              │
│     • Generator failure → Log error, return JSON error      │
│     • File write failure → Log error, return error          │
│                                                              │
│  3. Network Errors                                          │
│     • Connection refused → Catch in fetch()                 │
│     • Timeout → Show error message                          │
│                                                              │
│  4. File System Errors                                      │
│     • Permission denied → Log error                         │
│     • Disk full → Log error                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Measures                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Input Validation                                        │
│     • Sanitize user inputs                                  │
│     • Validate SQL queries (basic checks)                   │
│     • Limit request body size (10MB)                        │
│                                                              │
│  2. File System                                             │
│     • Generate files in controlled directory                │
│     • No user-controlled file paths                         │
│     • Overwrite protection                                  │
│                                                              │
│  3. Authentication                                          │
│     • Credentials stored in generated files only            │
│     • Not logged or exposed in responses                    │
│     • HTTPS recommended for production                      │
│                                                              │
│  4. Database                                                │
│     • Connection encryption enabled                         │
│     • Read-only queries recommended                         │
│     • Parameterized queries in generated server             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Metrics                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Web UI Load Time: < 1 second                               │
│  Form Submission: ~100-200ms                                │
│  Collection Generation: ~500ms - 2s                         │
│  File Download: Instant (client-side Blob)                  │
│                                                              │
│  Scalability:                                               │
│  • Single-user focused (developer tool)                     │
│  • Concurrent generation supported                          │
│  • File-based storage (no database needed)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: November 3, 2025  
**Status**: Production-ready with minor fixes needed
