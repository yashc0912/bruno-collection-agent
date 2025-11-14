#!/usr/bin/env node

/**
 * 🤖 AI Test Generator - Interactive CLI
 * 
 * Super simple way to generate API tests
 * Just answer a few questions, AI does the rest!
 */

const readline = require('readline');
const AITestGenerator = require('./ai-test-generator');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const generator = new AITestGenerator();

console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║      🤖 AI-Powered API Test Generator 🤖              ║
║                                                       ║
║   Just provide URL + Payload → Get complete tests!   ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

Let's create your API test in 5 simple steps...
`);

const questions = [];
const answers = {};

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function generateTest() {
  try {
    console.log('\n📝 Step 1: Test Name');
    answers.name = await ask('What should we call this test? (e.g., "Create User"): ');
    
    console.log('\n🌐 Step 2: API Endpoint');
    answers.url = await ask('API URL (e.g., https://api.example.com/users): ');
    
    console.log('\n⚡ Step 3: HTTP Method');
    answers.method = await ask('HTTP Method (GET, POST, PUT, DELETE) [default: POST]: ') || 'POST';
    
    console.log('\n📦 Step 4: Request Payload (if applicable)');
    console.log('Paste your JSON payload (or press Enter to skip):');
    const payloadInput = await ask('> ');
    
    if (payloadInput) {
      try {
        answers.payload = JSON.parse(payloadInput);
      } catch (e) {
        console.log('⚠️  Invalid JSON, using empty payload');
        answers.payload = {};
      }
    } else {
      answers.payload = {};
    }
    
    console.log('\n🔐 Step 5: Authentication (optional)');
    const authType = await ask('Auth type (basic/bearer/apikey/none) [default: none]: ') || 'none';
    
    if (authType !== 'none') {
      answers.auth = { type: authType };
      
      if (authType === 'basic') {
        answers.auth.username = await ask('Username: ');
        answers.auth.password = await ask('Password: ');
      } else if (authType === 'bearer') {
        answers.auth.token = await ask('Bearer Token: ');
      } else if (authType === 'apikey') {
        answers.auth.key = await ask('API Key: ');
        answers.auth.headerName = await ask('Header Name [default: X-API-Key]: ') || 'X-API-Key';
      }
    }
    
    console.log('\n\n🤖 AI is generating your tests...\n');
    
    // Generate the test
    const config = {
      name: answers.name,
      url: answers.url,
      method: answers.method.toUpperCase(),
      payload: answers.payload,
      headers: { 'Content-Type': 'application/json' },
      auth: answers.auth || null,
      assertions: [
        { type: 'status', value: 200, operator: 'toBe' }
      ]
    };
    
    const result = generator.generateTest(config);
    
    console.log('\n✅ Success! Your tests are ready!\n');
    console.log('📁 Generated Files:');
    console.log(`   → ${result.playwrightTest}`);
    console.log(`   → ${result.brunoFile}`);
    console.log('\n🚀 Run your tests:');
    console.log(`   npx playwright test tests/generated --reporter=html`);
    console.log(`   npx playwright show-report`);
    console.log('\n💡 Or with Bruno:');
    console.log(`   bruno run ${result.brunoFile}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Quick mode - paste JSON config
async function quickMode() {
  console.log('\n📋 Quick Mode: Paste your API config\n');
  console.log('Format:');
  console.log(`{
  "name": "My API Test",
  "url": "https://api.example.com/endpoint",
  "method": "POST",
  "payload": { "key": "value" },
  "auth": { "type": "basic", "username": "user", "password": "pass" }
}\n`);
  
  const config = await ask('Paste your config: ');
  
  try {
    const apiConfig = JSON.parse(config);
    
    // Set defaults
    apiConfig.headers = apiConfig.headers || { 'Content-Type': 'application/json' };
    apiConfig.assertions = apiConfig.assertions || [
      { type: 'status', value: 200, operator: 'toBe' }
    ];
    
    console.log('\n🤖 AI is generating your tests...\n');
    const result = generator.generateTest(apiConfig);
    
    console.log('✅ Success! Tests generated!\n');
    console.log('📁 Files:', result);
    console.log('\n🚀 Run: npx playwright test tests/generated --reporter=html');
    
  } catch (error) {
    console.error('❌ Invalid JSON format');
  } finally {
    rl.close();
  }
}

// Batch mode - generate multiple tests
async function batchMode() {
  console.log('\n📦 Batch Mode: Generate multiple tests at once\n');
  console.log('Paste your API collection (array of configs):');
  
  const collection = await ask('> ');
  
  try {
    const apis = JSON.parse(collection);
    
    if (!Array.isArray(apis)) {
      throw new Error('Must be an array of API configs');
    }
    
    console.log(`\n🤖 AI is generating ${apis.length} test suites...\n`);
    const results = generator.generateTestSuite(apis);
    
    console.log(`\n✅ Success! Generated ${results.length} test suites!`);
    console.log('🚀 Run all: npx playwright test tests/generated');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Main menu
async function main() {
  const mode = await ask(`
Choose mode:
  1. Interactive (Step-by-step) ⭐ Recommended
  2. Quick (Paste JSON config)
  3. Batch (Multiple tests)
  
Enter choice (1/2/3): `);
  
  console.log('');
  
  if (mode === '1') {
    await generateTest();
  } else if (mode === '2') {
    await quickMode();
  } else if (mode === '3') {
    await batchMode();
  } else {
    console.log('Invalid choice. Starting interactive mode...');
    await generateTest();
  }
}

// Run
main();
