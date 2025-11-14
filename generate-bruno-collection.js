#!/usr/bin/env node

/**
 * 🤖 AI Bruno Collection Generator - Interactive CLI
 * 
 * QA provides:
 * 1. API URL + Payload
 * 2. Database queries
 * 
 * AI generates:
 * - Complete Bruno Collection
 * - app.js with DB endpoints
 * - Ready to import!
 */

const readline = require('readline');
const BrunoCollectionGenerator = require('./bruno-collection-generator');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🤖 AI-Powered Bruno Collection Generator 🤖            ║
║                                                            ║
║   QA provides API + DB queries → Get complete Bruno       ║
║   collection with Data Prep + Positive + Negative tests!  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  try {
    console.log('\n📋 Let\'s create your Bruno collection!\n');

    // Step 1: Collection Name
    console.log('Step 1: Collection Details');
    console.log('─'.repeat(50));
    const collectionName = await ask('Collection name (e.g., "Get Customer Summary"): ');
    
    // Step 2: API Details
    console.log('\nStep 2: API Configuration');
    console.log('─'.repeat(50));
    const apiUrl = await ask('API URL: ');
    const method = await ask('HTTP Method (GET/POST/PUT/DELETE) [default: GET]: ') || 'GET';
    const integrationPoint = await ask('Integration Point name (e.g., GET_CUSTOMER): ');
    
    // Step 3: Request Payload
    console.log('\nStep 3: Request Payload');
    console.log('─'.repeat(50));
    let requestPayload = {};
    if (method !== 'GET') {
      console.log('Paste your JSON payload (or press Enter to skip):');
      const payloadInput = await ask('> ');
      if (payloadInput) {
        try {
          requestPayload = JSON.parse(payloadInput);
        } catch (e) {
          console.log('⚠️  Invalid JSON, using empty payload');
        }
      }
    }
    
    // Step 4: Authentication
    console.log('\nStep 4: Authentication');
    console.log('─'.repeat(50));
    const authType = await ask('Auth type (basic/bearer/none) [default: none]: ') || 'none';
    let auth = null;
    
    if (authType === 'basic') {
      const username = await ask('Username: ');
      const password = await ask('Password: ');
      auth = { type: 'basic', username, password };
    } else if (authType === 'bearer') {
      const token = await ask('Bearer Token: ');
      auth = { type: 'bearer', token };
    }
    
    // Step 5: Database Configuration
    console.log('\nStep 5: Database Configuration');
    console.log('─'.repeat(50));
    const dbUser = await ask('Database username: ');
    const dbPassword = await ask('Database password: ');
    const dbServer = await ask('Database server: ');
    const dbName = await ask('Database name: ');
    
    const dbConfig = {
      user: dbUser,
      password: dbPassword,
      server: dbServer,
      database: dbName,
      options: { encrypt: true }
    };
    
    // Step 6: Database Queries
    console.log('\nStep 6: Database Queries');
    console.log('─'.repeat(50));
    console.log('Add database queries for data preparation...\n');
    
    const dbQueries = [];
    let addMore = true;
    let queryNum = 1;
    
    while (addMore) {
      console.log(`\nQuery ${queryNum}:`);
      const queryName = await ask(`  Name (e.g., "Success Client ID"): `);
      if (!queryName) break;
      
      const endpoint = await ask(`  Endpoint path (e.g., "/client-data"): `);
      const queryMethod = await ask(`  Method [default: GET]: `) || 'GET';
      const varName = await ask(`  Variable name to store result (e.g., "clientId"): `);
      const description = await ask(`  Description: `);
      
      console.log('  Paste SQL query (end with semicolon or press Enter twice):');
      const query = await ask('  > ');
      
      dbQueries.push({
        name: queryName,
        endpoint: endpoint,
        method: queryMethod,
        variableName: varName,
        description: description,
        query: query,
        params: [] // Can be enhanced to extract params from endpoint
      });
      
      queryNum++;
      const continueAdding = await ask('\nAdd another query? (yes/no) [default: no]: ');
      addMore = continueAdding.toLowerCase() === 'yes' || continueAdding.toLowerCase() === 'y';
    }
    
    if (dbQueries.length === 0) {
      console.log('\n⚠️  No database queries added. Adding default health check...');
      dbQueries.push({
        name: "Health Check",
        endpoint: "/health",
        method: "GET",
        variableName: "health",
        description: "Verify server is running",
        query: "SELECT 1 AS STATUS",
        params: []
      });
    }
    
    // Generate Collection
    console.log('\n\n🤖 AI is generating your Bruno collection...\n');
    console.log('═'.repeat(60));
    
    const config = {
      collectionName,
      apiUrl,
      method,
      integrationPoint,
      requestPayload,
      auth,
      dbConfig,
      dbQueries
    };
    
    const generator = new BrunoCollectionGenerator();
    const result = generator.generateCollection(config);
    
    console.log('═'.repeat(60));
    console.log('\n🎉 SUCCESS! Your Bruno collection is ready!\n');
    console.log('📁 Files generated in: bruno-generated/\n');
    console.log('Next steps:');
    console.log('  1. cd bruno-generated');
    console.log('  2. npm install');
    console.log('  3. node app.js');
    console.log('  4. Import JSON file into Bruno\n');
    console.log('📄 See BRUNO_SETUP_INSTRUCTIONS.md for detailed guide\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Quick mode - paste configuration JSON
async function quickMode() {
  console.log('\n📋 Quick Mode: Paste your complete configuration\n');
  console.log('Format:');
  console.log(`{
  "collectionName": "My API Tests",
  "apiUrl": "https://api.example.com/endpoint",
  "method": "POST",
  "requestPayload": { "key": "value" },
  "auth": { "type": "basic", "username": "user", "password": "pass" },
  "dbConfig": {
    "user": "dbuser",
    "password": "dbpass",
    "server": "server.database.windows.net",
    "database": "MyDB",
    "options": { "encrypt": true }
  },
  "dbQueries": [
    {
      "name": "Get Test Data",
      "endpoint": "/test-data",
      "method": "GET",
      "variableName": "testId",
      "description": "Fetch test data",
      "query": "SELECT MAX(ID) AS VALUE FROM Table",
      "params": []
    }
  ]
}\n`);
  
  console.log('Paste your config:');
  const configInput = await ask('> ');
  
  try {
    const config = JSON.parse(configInput);
    
    console.log('\n🤖 Generating Bruno collection...\n');
    const generator = new BrunoCollectionGenerator();
    generator.generateCollection(config);
    
    console.log('\n✅ Complete! Check bruno-generated/ folder\n');
  } catch (error) {
    console.error('❌ Invalid JSON:', error.message);
  } finally {
    rl.close();
  }
}

// Main menu
async function showMenu() {
  const mode = await ask(`
Choose mode:
  1. Interactive (Step-by-step) ⭐ Recommended
  2. Quick (Paste JSON config)
  
Enter choice (1/2): `);
  
  console.log('');
  
  if (mode === '1') {
    await main();
  } else if (mode === '2') {
    await quickMode();
  } else {
    console.log('Invalid choice. Starting interactive mode...');
    await main();
  }
}

// Run
showMenu();
