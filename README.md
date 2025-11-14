# 🤖 Bruno Collection Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/playwright-1.56.1-45ba4b)](https://playwright.dev/)

> **AI-Powered API Test Collection Generator** - Create comprehensive Bruno API test collections with zero coding required. Features an intuitive Web UI, database integration, and intelligent test scenario generation.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

Bruno Collection Generator is an intelligent solution for creating complete API test collections automatically. It combines:

- **🌐 Web UI**: User-friendly 5-step wizard for non-technical users
- **🤖 AI Generation**: Smart test scenario creation with boundary and negative testing
- **🗄️ Database Integration**: Pull test data directly from your databases
- **✅ QA Validation**: Built-in validation for responses, fields, and SQL checks
- **📦 In-Memory Storage**: H2-like temporary storage with auto-cleanup
- **🧪 Playwright Testing**: End-to-end testing with Playwright integration

Perfect for **QA engineers**, **API developers**, and **automation teams** looking to accelerate their testing workflow.

---

## ✨ Key Features

### 🌐 Web Interface
- ✅ **Zero Coding Required** - Point-and-click interface
- ✅ **5-Step Wizard** - Intuitive collection creation flow
- ✅ **Real-Time Preview** - See configurations before generating
- ✅ **Auto-Cleanup** - Collections expire after 1 hour
- ✅ **Multiple Download Options** - Individual files or all-in-one ZIP

### 🤖 Intelligent Test Generation
- ✅ **Positive Scenarios** - Happy path testing from DB queries
- ✅ **Negative Scenarios** - Error handling and edge cases
- ✅ **Boundary Testing** - Min/max values and limits
- ✅ **Security Testing** - Authentication and authorization
- ✅ **SQL Validation** - Post-execution database checks

### 🗄️ Database Support
- ✅ **Microsoft SQL Server** (with encryption)
- ✅ **H2 In-Memory Database** (zero config)
- 🔜 **MySQL** (coming soon)
- 🔜 **PostgreSQL** (coming soon)

### 🔐 Authentication Methods
- None (public APIs)
- Basic Auth (username/password)
- Bearer Token (JWT, OAuth)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14.0.0 or higher
- **npm** v6.0.0 or higher
- (Optional) **Bruno API Client** for running generated collections

### Installation

```bash
# Clone the repository
git clone https://github.com/yashc0912/bruno-collection-generator.git
cd bruno-collection-generator

# Install dependencies
npm install
```

### Start the Web UI

```bash
# Option 1: Using npm script (recommended)
npm start

# Option 2: Using batch file (Windows)
start-web-ui.bat

# Option 3: Direct node command
node web-ui/server.js
```

🌐 Open your browser to: **http://localhost:3001**

---

## 💻 Usage

### Method 1: Web UI (Recommended)

1. **Launch Web UI**
   ```bash
   npm start
   ```

2. **Follow the 5-Step Wizard**:
   - **Step 1**: Enter collection name
   - **Step 2**: Configure API endpoint and method
   - **Step 3**: Set up authentication
   - **Step 4**: Configure database connection
   - **Step 5**: Add QA validations (optional)

3. **Generate & Download**
   - Click "Generate Collection"
   - Download individual files or all-in-one ZIP

### Method 2: CLI Generator

```bash
# Using the CLI with a config file
node generate-bruno-collection.js

# Or use the npm script
npm run generate
```

**Example Configuration** (`examples/sample-config.json`):

```json
{
  "collectionName": "My API Tests",
  "apiUrl": "https://api.example.com/v1/resource/{id}",
  "httpMethod": "GET",
  "authType": "bearer",
  "bearerToken": "your-token-here",
  "dbConfig": {
    "user": "db-user",
    "password": "db-password",
    "server": "db-server.example.com",
    "database": "MyDatabase"
  },
  "dataQueries": [
    {
      "name": "Valid Resources",
      "endpoint": "/valid-data",
      "query": "SELECT id, name FROM resources WHERE active = 1"
    }
  ]
}
```

### Method 3: AI Test Generator

```bash
# Generate Playwright tests using AI
node ai-test-generator.js
```

---

## 📚 Documentation

Comprehensive guides are available in the [`docs/`](docs/) folder:

### Getting Started
- [**Bruno Quick Start**](docs/BRUNO_QUICK_START.md) - Get started in 5 minutes
- [**Bruno System Overview**](docs/BRUNO_SYSTEM_OVERVIEW.md) - Understand the architecture

### User Guides
- [**Bruno Generator Guide**](docs/BRUNO_GENERATOR_GUIDE.md) - Complete Web UI walkthrough
- [**AI Test Generator Guide**](docs/AI_TEST_GENERATOR_GUIDE.md) - Playwright test generation
- [**Get Contract Summary Guide**](docs/GET_CONTRACT_SUMMARY_GUIDE.md) - Real-world example

### Deployment
- [**Local Deployment Guide**](docs/LOCAL_DEPLOYMENT_GUIDE.md) - Run locally
- [**AWS Deployment Guide**](docs/AWS_DEPLOYMENT_GUIDE.md) - Deploy to AWS

### Technical Documentation
- [**Architecture**](docs/ARCHITECTURE.md) - System design and components
- [**Download Troubleshooting**](docs/DOWNLOAD_TROUBLESHOOTING.md) - Fix common issues
- [**Improvements Summary**](docs/IMPROVEMENTS_SUMMARY.md) - Recent enhancements

---

## 📁 Project Structure

```
bruno-collection-generator/
├── 📁 web-ui/                     # Web UI application
│   ├── index.html                 # Main Web UI page
│   ├── server.js                  # Express server
│   ├── script.js                  # Frontend logic
│   └── styles.css                 # UI styling
│
├── 📁 tests/                      # Playwright E2E tests
│   ├── web-ui-sanity.spec.js      # Web UI tests
│   └── generate-collection-e2e.spec.js
│
├── 📁 examples/                   # Example configurations
│   ├── sample-config.json         # Sample config file
│   └── sample_scenarios.csv       # Sample test scenarios
│
├── 📁 docs/                       # Documentation
│   ├── BRUNO_QUICK_START.md
│   ├── BRUNO_GENERATOR_GUIDE.md
│   ├── AI_TEST_GENERATOR_GUIDE.md
│   └── ... (more guides)
│
├── 📄 bruno-collection-generator.js   # Core generation logic
├── 📄 generate-bruno-collection.js    # CLI entry point
├── 📄 ai-test-generator.js            # AI-powered test gen
├── 📄 generate-test.js                # Test generation utilities
├── 📄 start-web-ui.bat                # Windows launcher
├── 📄 package.json                    # Dependencies
├── 📄 .gitignore                      # Git ignore rules
└── 📄 README.md                       # This file
```

---

## 🧪 Testing

Run the included Playwright tests:

```bash
# Run all tests
npm test

# Run only Web UI tests
npm run test:ui

# Run tests in UI mode (interactive)
npx playwright test --ui
```

---

## 🛠️ Built With

- **[Express.js](https://expressjs.com/)** - Web server framework
- **[Playwright](https://playwright.dev/)** - End-to-end testing
- **[mssql](https://www.npmjs.com/package/mssql)** - SQL Server driver
- **[uuid](https://www.npmjs.com/package/uuid)** - Unique ID generation

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Run tests
npm test
```

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yash Choubey**
- GitHub: [@yashc0912](https://github.com/yashc0912)

---

## 🙏 Acknowledgments

- **Bruno API Client** - For providing an excellent API testing platform
- **Playwright Team** - For robust testing tools
- **Node.js Community** - For amazing libraries and support

---

## 📞 Support

- 📧 **Email**: [Create an issue](https://github.com/yashc0912/bruno-collection-generator/issues)
- 📚 **Documentation**: [docs/](docs/)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yashc0912/bruno-collection-generator/issues)

---

## 🗺️ Roadmap

- [ ] **PostgreSQL Support** - Add PostgreSQL database integration
- [ ] **MySQL Support** - Add MySQL database integration
- [ ] **GraphQL Support** - Generate tests for GraphQL APIs
- [ ] **CI/CD Integration** - GitHub Actions workflows
- [ ] **Docker Support** - Containerize the application
- [ ] **Cloud Deployment** - One-click deploy to AWS/Azure/GCP
- [ ] **Test Result Analytics** - Dashboard for test execution results
- [ ] **Multi-language Support** - i18n for Web UI

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Yash Choubey](https://github.com/yashc0912)

</div>
