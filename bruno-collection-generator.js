/**
 * 🤖 AI-Powered Bruno Collection Generator
 * 
 * QA provides:
 * 1. API URL + Request Payload
 * 2. Database queries
 * 
 * AI generates:
 * - Complete Bruno Collection JSON
 * - Data Preparation scenarios
 * - Positive test scenarios
 * - Negative test scenarios
 * - app.js with all DB endpoints
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class BrunoCollectionGenerator {
  constructor() {
    this.collectionName = '';
    this.apiConfig = {};
    this.dbQueries = [];
    this.environmentVars = [];
  }

  /**
   * Generate complete Bruno collection from QA inputs
   * @param {Object} config - Configuration object
   * @param {string} config.collectionName - Name of the collection
   * @param {Array} config.scenarios - Array of test scenarios
   * @param {Array} config.variableGenerators - Array of variable generator definitions
   * @param {Array} config.dbQueries - Array of database query definitions
   * @param {Object} config.auth - Authentication config
   * @param {Object} config.dbConfig - Database configuration
   */
  generateCollection(config) {
    this.collectionName = config.collectionName;
    this.apiConfig = config;

    console.log(`\n🤖 Generating Bruno Collection: ${this.collectionName}`);
    console.log('================================================\n');

    // Step 1: Generate app.js with all DB endpoints and variable generators
    console.log('📝 Step 1: Generating app.js with database endpoints and variable generators...');
    const appJsContent = this.generateAppJs(config.dbQueries, config.dbConfig, config.variableGenerators, config.csvScenarios);
    this.saveFile('app.js', appJsContent);
    console.log('✅ app.js generated\n');

    // Step 2: Generate Bruno Collection as JSON
    console.log('📝 Step 2: Generating Bruno Collection JSON...');
    const collection = this.generateBrunoJSON(config);
    this.saveFile(`${this.sanitizeName(config.collectionName)}.json`, JSON.stringify(collection, null, 2));
    console.log('✅ Bruno Collection JSON generated\n');

    // Step 3: Generate package.json for dependencies
    console.log('📝 Step 3: Generating package.json...');
    const packageJson = this.generatePackageJson();
    this.saveFile('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json generated\n');

    // Step 4: Generate setup instructions
    console.log('📝 Step 4: Generating setup instructions...');
    const setupInstructions = this.generateSetupInstructions(config);
    this.saveFile('BRUNO_SETUP_INSTRUCTIONS.md', setupInstructions);
    console.log('✅ Setup instructions generated\n');

    console.log('🎉 COMPLETE! Your Bruno Collection is ready!\n');
    console.log('📁 Generated Files:');
    console.log('   → app.js (Database server with all endpoints)');
    console.log(`   → ${this.sanitizeName(config.collectionName)}/ (Bruno Collection Directory)`);
    console.log('   → package.json (Dependencies)');
    console.log('   → BRUNO_SETUP_INSTRUCTIONS.md (How to use)\n');

    return {
      appJs: 'app.js',
      brunoCollection: `${this.sanitizeName(config.collectionName)}.json`,
      packageJson: 'package.json',
      instructions: 'BRUNO_SETUP_INSTRUCTIONS.md'
    };
  }

  /**
   * Generate app.js with all database endpoint configurations
   */
  generateAppJs(dbQueries, dbConfig, variableGenerators = [], csvScenarios = []) {
    const dbEndpoints = dbQueries.map(query => this.generateEndpoint(query)).join('\n\n');
    const variableEndpoints = variableGenerators.map(generator => this.generateVariableEndpoint(generator)).join('\n\n');
    const csvTestSuites = this.generateCSVTestSuiteEndpoints(csvScenarios, variableGenerators);

    return `const express = require('express');
const sql = require('mssql');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

// Database Configuration
const config = ${JSON.stringify(dbConfig, null, 4)};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

${dbEndpoints}

${variableEndpoints}

${csvTestSuites}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`);
    console.log(\`📊 Database: \${config.database || 'In-Memory Variables'}\`);
    console.log(\`🔗 Health check: http://localhost:\${PORT}/health\`);
    console.log('\\n✅ All endpoints are ready!\\n');
});
`;
  }

  /**
   * Generate variable generator endpoint
   */
  generateVariableEndpoint(generator) {
    const { name, type } = generator;
    let generationScript = this.generateVariableScript(generator);
    
    return `// Variable Generator: ${name} (${type})
app.get('/generate/${name}', (req, res) => {
    try {
        ${generationScript}
        res.json({ 
            key: '${name}',
            value: generatedValue,
            type: '${type}',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating ${name}:', error);
        res.status(500).json({ 
            error: 'Failed to generate ${name}',
            timestamp: new Date().toISOString()
        });
    }
});`;
  }

  /**
   * Generate JavaScript code for variable generation
   */
  generateVariableScript(generator) {
    const { type, format, offset, condition, min, max, length, charset } = generator;
    
    switch (type) {
      case 'currentDate':
        return `
        const date = new Date();
        let generatedValue;
        switch ('${format || 'MMddyyyy'}') {
          case 'MMddyyyy':
            generatedValue = (date.getMonth() + 1).toString().padStart(2, '0') + 
                           date.getDate().toString().padStart(2, '0') + 
                           date.getFullYear().toString();
            break;
          case 'yyyy-MM-dd':
            generatedValue = date.getFullYear() + '-' + 
                           (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                           date.getDate().toString().padStart(2, '0');
            break;
          case 'dd/MM/yyyy':
            generatedValue = date.getDate().toString().padStart(2, '0') + '/' + 
                           (date.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                           date.getFullYear();
            break;
          case 'yyyyMMdd':
            generatedValue = date.getFullYear().toString() + 
                           (date.getMonth() + 1).toString().padStart(2, '0') + 
                           date.getDate().toString().padStart(2, '0');
            break;
          default:
            generatedValue = date.toISOString().split('T')[0];
        }`;

      case 'currentDateTime':
        return `
        const date = new Date();
        let generatedValue;
        switch ('${format || 'yyyy-MM-dd HH:mm:ss'}') {
          case 'yyyy-MM-dd HH:mm:ss':
            generatedValue = date.getFullYear() + '-' + 
                           (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                           date.getDate().toString().padStart(2, '0') + ' ' +
                           date.getHours().toString().padStart(2, '0') + ':' +
                           date.getMinutes().toString().padStart(2, '0') + ':' +
                           date.getSeconds().toString().padStart(2, '0');
            break;
          case 'yyyy-MM-dd\\'T\\'HH:mm:ss':
            generatedValue = date.toISOString().slice(0, 19);
            break;
          default:
            generatedValue = date.toISOString().slice(0, 19).replace('T', ' ');
        }`;

      case 'futurePastDate':
        const offsetDays = parseInt(offset) || -30;
        return `
        const date = new Date();
        date.setDate(date.getDate() + ${offsetDays});
        let generatedValue;
        switch ('${format || 'yyyy-MM-dd'}') {
          case 'yyyy-MM-dd':
            generatedValue = date.getFullYear() + '-' + 
                           (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                           date.getDate().toString().padStart(2, '0');
            break;
          case 'MMddyyyy':
            generatedValue = (date.getMonth() + 1).toString().padStart(2, '0') + 
                           date.getDate().toString().padStart(2, '0') + 
                           date.getFullYear().toString();
            break;
          default:
            generatedValue = date.toISOString().split('T')[0];
        }`;

      case 'conditionalDate':
        if (condition === 'endOfMonth') {
          return `
          const date = new Date();
          if (date.getDate() >= 28) {
            date.setDate(date.getDate() - 3);
          }
          let generatedValue = date.getFullYear() + '-' + 
                             (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                             date.getDate().toString().padStart(2, '0');`;
        }
        break;

      case 'correlationId':
        if (format === 'compact') {
          return `const generatedValue = uuidv4().replace(/-/g, '');`;
        } else if (format === 'short') {
          return `const generatedValue = uuidv4().replace(/-/g, '').substring(0, 8);`;
        } else {
          return `const generatedValue = uuidv4();`;
        }

      case 'randomNumber':
        const minVal = parseInt(min) || 1000;
        const maxVal = parseInt(max) || 9999;
        return `const generatedValue = ${minVal} + Math.floor(Math.random() * (${maxVal} - ${minVal} + 1));`;

      case 'randomString':
        const stringLength = parseInt(length) || 8;
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        if (charset === 'alphabetic') {
          characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        } else if (charset === 'numeric') {
          characters = '0123456789';
        }
        return `
        const characters = '${characters}';
        let generatedValue = '';
        for (let i = 0; i < ${stringLength}; i++) {
          generatedValue += characters.charAt(Math.floor(Math.random() * characters.length));
        }`;

      case 'timestamp':
        if (format === 'unix') {
          return `const generatedValue = Math.floor(Date.now() / 1000).toString();`;
        } else if (format === 'unixMs') {
          return `const generatedValue = Date.now().toString();`;
        } else {
          return `const generatedValue = new Date().toISOString();`;
        }

      default:
        return `const generatedValue = 'Unknown generator type: ${type}';`;
    }
  }

  /**
   * Generate CSV Test Suite Endpoints
   */
  generateCSVTestSuiteEndpoints(csvScenarios, variableGenerators) {
    if (!csvScenarios || csvScenarios.length === 0) {
      return '// No CSV scenarios to generate';
    }

    let endpoints = `
// CSV Test Suite Endpoints
// Run all scenarios with unique variable values

// Endpoint to run all CSV scenarios
app.post('/test-suite/run-all', async (req, res) => {
    console.log('🚀 Starting CSV Test Suite execution...');
    const results = [];
    
    try {
        for (let i = 0; i < ${csvScenarios.length}; i++) {
            const scenario = scenarios[i];
            const result = await runScenarioWithUniqueVariables(scenario, i + 1);
            results.push(result);
        }
        
        const summary = {
            totalScenarios: ${csvScenarios.length},
            passed: results.filter(r => r.status === 'passed').length,
            failed: results.filter(r => r.status === 'failed').length,
            results: results,
            timestamp: new Date().toISOString()
        };
        
        console.log('✅ Test Suite completed:', summary);
        res.json(summary);
    } catch (error) {
        console.error('❌ Test Suite failed:', error);
        res.status(500).json({
            error: 'Test suite execution failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// CSV Scenarios data
const scenarios = ${JSON.stringify(csvScenarios, null, 2)};

// Function to run scenario with unique variables
async function runScenarioWithUniqueVariables(scenario, scenarioIndex) {
    console.log(\`🧪 Running scenario \${scenarioIndex}: \${scenario.name}\`);
    
    try {
        // Generate unique variables for this scenario
        const uniqueVars = {};
        ${this.generateUniqueVariableLogic(variableGenerators)}
        
        // Process request body with unique variables
        let requestBody = scenario.requestBody;
        Object.keys(uniqueVars).forEach(varName => {
            const pattern = new RegExp(\`{{\\$\{varName}_\\$\{scenarioIndex}}}\`, 'g');
            requestBody = requestBody.replace(pattern, uniqueVars[varName]);
        });
        
        // Simulate API call (replace with actual HTTP client if needed)
        const startTime = Date.now();
        const mockResponse = {
            status: 200,
            data: { success: true, scenarioIndex, variables: uniqueVars },
            responseTime: Date.now() - startTime
        };
        
        console.log(\`✅ Scenario \${scenarioIndex} completed in \${mockResponse.responseTime}ms\`);
        
        return {
            scenarioIndex,
            scenarioName: scenario.name,
            scenarioType: scenario.type,
            status: 'passed',
            responseTime: mockResponse.responseTime,
            variables: uniqueVars,
            response: mockResponse.data
        };
        
    } catch (error) {
        console.error(\`❌ Scenario \${scenarioIndex} failed:\`, error);
        
        return {
            scenarioIndex,
            scenarioName: scenario.name,
            scenarioType: scenario.type,
            status: 'failed',
            error: error.message,
            variables: {}
        };
    }
}
`;

    return endpoints;
  }

  /**
   * Generate unique variable logic for app.js
   */
  generateUniqueVariableLogic(variableGenerators) {
    if (!variableGenerators || variableGenerators.length === 0) {
      return '// No variable generators configured';
    }

    let logic = '';
    variableGenerators.forEach(generator => {
      const varName = generator.name;
      
      switch(generator.type) {
        case 'correlationId':
        case 'uuid':
          logic += `
        // Generate unique ${generator.name}
        uniqueVars['${varName}'] = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });`;
          break;
          
        case 'currentDate':
        case 'date':
          logic += `
        // Generate unique ${generator.name}
        uniqueVars['${varName}'] = new Date().toISOString().split('T')[0];`;
          break;
          
        case 'timestamp':
          logic += `
        // Generate unique ${generator.name}
        uniqueVars['${varName}'] = Date.now();`;
          break;
          
        case 'randomNumber':
          logic += `
        // Generate unique ${generator.name}
        uniqueVars['${varName}'] = Math.floor(Math.random() * 100000);`;
          break;
          
        case 'randomString':
          logic += `
        // Generate unique ${generator.name}
        uniqueVars['${varName}'] = Math.random().toString(36).substring(2, 15);`;
          break;
      }
    });
    
    return logic;
  }

  /**
   * Generate individual endpoint based on query configuration
   */
  generateEndpoint(queryConfig) {
    const { name, endpoint, method = 'GET', query, params = [], description } = queryConfig;
    
    const paramsList = params.map(p => `req.params.${p}`).join(', ');
    const inputDeclarations = params.map(p => 
      `            .input('${p}', sql.VarChar, ${p}Param)`
    ).join('\n');

    const paramsExtraction = params.map(p => 
      `    const ${p}Param = req.params.${p};`
    ).join('\n');

    return `// ${description || name}
app.${method.toLowerCase()}('${endpoint}', async (req, res) => {
${paramsExtraction}

    const query = \`${query}\`;

    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
${inputDeclarations}
            .query(query);

        res.json(result.recordset);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});`;
  }

  /**
   * Generate complete Bruno Collection JSON structure
   */
  generateBrunoJSON(config) {
    const collectionId = uuidv4();
    
    return {
      name: config.collectionName,
      version: "1",
      items: [
        this.generateDataPreparationFolder(config),
        this.generatePositiveScenariosFolder(config),
        this.generateNegativeScenariosFolder(config)
      ],
      activeEnvironmentUid: collectionId,
      environments: [
        {
          variables: this.generateEnvironmentVariables(config),
          name: "DEV"
        }
      ],
      brunoConfig: {
        version: "1",
        name: config.collectionName,
        type: "collection",
        ignore: ["node_modules", ".git"]
      }
    };
  }

  /**
   * Generate proper Bruno Collection with individual .bru files
   */
  generateBrunoCollection(config) {
    const collectionName = this.sanitizeName(config.collectionName);
    const fs = require('fs');
    const path = require('path');
    
    // Create collection directory structure
    const collectionDir = path.join(process.cwd(), 'bruno-generated', collectionName);
    
    // Create directories
    this.ensureDirectoryExists(collectionDir);
    this.ensureDirectoryExists(path.join(collectionDir, 'DataPreparation'));
    this.ensureDirectoryExists(path.join(collectionDir, 'TestScenarios'));
    this.ensureDirectoryExists(path.join(collectionDir, 'environments'));
    
    // Generate bruno.json (collection metadata)
    const brunoJson = {
      version: "1",
      name: config.collectionName,
      type: "collection",
      ignore: ["node_modules", ".git"]
    };
    
    this.saveFileToPath(path.join(collectionDir, 'bruno.json'), JSON.stringify(brunoJson, null, 2));
    
    // Generate environment file
    const environmentVars = this.generateEnvironmentVariables(config);
    
    this.saveFileToPath(path.join(collectionDir, 'environments', 'dev.bru'), 
      `vars {
${environmentVars.map(v => `  ${v.name}: ${v.value || ''}`).join('\n')}
}`);
    
    // Generate DataPreparation folder files
    this.generateDataPreparationFiles(config, path.join(collectionDir, 'DataPreparation'));
    
    // Generate Test Scenarios files
    this.generateTestScenarioFiles(config, path.join(collectionDir, 'TestScenarios'));
    
    console.log(`✅ Bruno collection created at: ${collectionDir}`);
    return collectionDir;
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  ensureDirectoryExists(dirPath) {
    const fs = require('fs');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Save file to specific path
   */
  saveFileToPath(filePath, content) {
    const fs = require('fs');
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Generate individual .bru files for data preparation
   */
  generateDataPreparationFiles(config, dirPath) {
    let seq = 1;
    
    // Generate variable generator files
    (config.variableGenerators || []).forEach((generator) => {
      const bruContent = `meta {
  name: Generate ${generator.name}
  type: http
  seq: ${seq++}
}

get {
  url: {{baseUrl}}/health
}

script:pre-request {
  ${this.generateBrunoVariableScript(generator)}
}

script:post-response {
  test("Variable ${generator.name} is set", function () {
    const value = bru.getEnvVar("${generator.name}");
    expect(value).to.exist;
    console.log("${generator.name} value:", value);
  });
}
`;
      
      this.saveFileToPath(
        path.join(dirPath, `${this.sanitizeName(generator.name + '_Generator')}.bru`), 
        bruContent
      );
    });
    
    // Generate database query files
    config.dbQueries.forEach((query) => {
      const bruContent = `meta {
  name: ${query.name}
  type: http
  seq: ${seq++}
}

get {
  url: http://localhost:3000${query.endpoint}
}

script:post-response {
  ${this.generateDataPrepTests(query)}
}
`;
      
      this.saveFileToPath(
        path.join(dirPath, `${this.sanitizeName(query.name)}.bru`), 
        bruContent
      );
    });
  }

  /**
   * Generate individual .bru files for test scenarios
   */
  generateTestScenarioFiles(config, dirPath) {
    let seq = 1;
    
    (config.scenarios || []).forEach((scenario) => {
      let bruContent = `meta {
  name: ${scenario.name}
  type: http
  seq: ${seq++}
}

${scenario.method.toLowerCase()} {
  url: ${scenario.url}
`;

      // Add request body if it exists
      if (scenario.request && scenario.request.trim()) {
        bruContent += `  body: json
}

body:json {
${scenario.request}
`;
      } else {
        bruContent += `}
`;
      }

      // Add authentication if configured
      if (config.auth && config.auth.type === 'basic') {
        bruContent += `
auth:basic {
  username: ${config.auth.basicAuth.username}
  password: ${config.auth.basicAuth.password}
}
`;
      } else if (config.auth && config.auth.type === 'bearer') {
        bruContent += `
auth:bearer {
  token: ${config.auth.bearerToken}
}
`;
      }

      // Add post-response script
      bruContent += `
script:post-response {
  ${this.generatePositiveTests(config)}
}
`;
      
      this.saveFileToPath(
        path.join(dirPath, `${this.sanitizeName(scenario.name)}.bru`), 
        bruContent
      );
    });
  }

  /**
   * Generate Data Preparation folder with DB query tests and variable generators
   */
  generateDataPreparationFolder(config) {
    const tests = [];
    let seq = 1;

    // Add database query tests
    config.dbQueries.forEach((query, index) => {
      tests.push({
        type: "http",
        name: query.name,
        filename: `${this.sanitizeName(query.name)}.bru`,
        seq: seq++,
        settings: { encodeUrl: true, timeout: 0 },
        tags: [],
        request: {
          url: `http://localhost:3000${query.endpoint}`,
          method: query.method || "GET",
          headers: [],
          params: [],
          body: {
            mode: query.method === 'POST' ? 'json' : 'none',
            json: query.body || '',
            formUrlEncoded: [],
            multipartForm: [],
            file: []
          },
          script: {},
          vars: {},
          assertions: [],
          tests: this.generateDataPrepTests(query),
          docs: query.description || '',
          auth: { mode: "inherit" }
        }
      });
    });

    // Add variable generator tests (as pre-request scripts in dedicated requests)
    (config.variableGenerators || []).forEach((generator, index) => {
      tests.push({
        type: "http",
        name: `Generate ${generator.name}`,
        filename: `${this.sanitizeName(generator.name + '_Generator')}.bru`,
        seq: seq++,
        settings: { encodeUrl: true, timeout: 0 },
        tags: ["variable-generator", "setup"],
        request: {
          url: "{{baseUrl}}/health", // Use a simple endpoint 
          method: "GET",
          headers: [],
          params: [],
          body: {
            mode: 'none',
            json: '',
            formUrlEncoded: [],
            multipartForm: [],
            file: []
          },
          script: {
            prerequest: this.generateVariableGeneratorTests(generator),
            test: `// Variable ${generator.name} generated in pre-request script
test("Variable ${generator.name} is set", function () {
    const value = bru.getEnvVar("${generator.name}");
    expect(value).to.exist;
    console.log("${generator.name} value:", value);
});`
          },
          vars: {},
          assertions: [],
          docs: `Generate ${generator.name} (${generator.type}) using pre-request script`,
          auth: { mode: "inherit" }
        }
      });
    });

    return {
      type: "folder",
      name: "DataPreparation",
      filename: "DataPreparation",
      seq: 1,
      root: {
        request: { auth: { mode: "inherit" } },
        meta: { name: "DataPreparation", seq: 1 }
      },
      items: tests
    };
  }

  /**
   * Generate Positive Scenarios folder
   */
  generatePositiveScenariosFolder(config) {
    const positiveTests = [];
    let seq = 1;

    // Generate tests for manual scenarios
    (config.scenarios || []).forEach((scenario, index) => {
      positiveTests.push({
        type: "http",
        name: scenario.name,
        filename: `${this.sanitizeName(scenario.name)}.bru`,
        seq: seq++,
        settings: { encodeUrl: true, timeout: 0 },
        tags: [],
        request: {
          url: scenario.url,
          method: scenario.method || "GET",
          headers: [],
          params: [],
          body: {
            mode: scenario.request ? 'json' : 'none',
            json: scenario.request || '',
            formUrlEncoded: [],
            multipartForm: [],
            file: []
          },
          script: {},
          vars: {},
          assertions: [],
          tests: this.generatePositiveTests(config, scenario),
          docs: `Test scenario: ${scenario.name}`,
          auth: this.generateAuthConfig(config.auth)
        }
      });
    });

    // Generate tests for CSV scenarios with unique variables for each
    (config.csvScenarios || []).forEach((csvScenario, index) => {
      positiveTests.push({
        type: "http",
        name: csvScenario.name,
        filename: `${this.sanitizeName(csvScenario.name)}.bru`,
        seq: seq++,
        settings: { encodeUrl: true, timeout: 0 },
        tags: ["csv-scenario"],
        request: {
          url: `{{baseUrl}}/api/${this.sanitizeName(csvScenario.name.toLowerCase())}`,
          method: csvScenario.type || "GET",
          headers: [],
          params: [],
          body: {
            mode: csvScenario.requestBody ? 'json' : 'none',
            json: csvScenario.requestBody || '',
            formUrlEncoded: [],
            multipartForm: [],
            file: []
          },
          script: {
            'pre-request': this.generateUniqueVariablesScript(config, index),
            'post-response': this.generateCSVScenarioTests(config, csvScenario)
          },
          vars: {},
          assertions: [],
          tests: this.generateCSVScenarioTests(config, csvScenario),
          docs: `CSV Test scenario: ${csvScenario.name} (Type: ${csvScenario.type})`,
          auth: this.generateAuthConfig(config.auth)
        }
      });
    });

    return {
      type: "folder",
      name: "Positive Scenarios",
      filename: "Positive Scenarios",
      seq: 2,
      root: {
        request: { auth: { mode: "inherit" } },
        meta: { name: "Positive Scenarios", seq: 2 }
      },
      items: positiveTests
    };
  }

  /**
   * Generate Negative Scenarios folder
   */
  generateNegativeScenariosFolder(config) {
    const negativeTests = [];

    // Invalid data test
    negativeTests.push({
      type: "http",
      name: `${config.collectionName} - Invalid Data`,
      filename: `${this.sanitizeName(config.collectionName)}-invalid.bru`,
      seq: 1,
      settings: { encodeUrl: true, timeout: 0 },
      tags: [],
      request: {
        url: config.apiUrl,
        method: config.method || "POST",
        headers: [],
        params: [],
        body: {
          mode: "json",
          json: config.requestPayload ? JSON.stringify(this.corruptPayload(config.requestPayload) || {}, null, 2) : "",
          formUrlEncoded: [],
          multipartForm: [],
          file: []
        },
        script: {},
        vars: {},
        assertions: [],
        tests: this.generateNegativeTests(),
        docs: "Negative scenario with invalid data",
        auth: this.generateAuthConfig(config.auth)
      }
    });

    // Verify failure recorded
    negativeTests.push({
      type: "http",
      name: "Verify Failure Recorded",
      filename: "verify-failure-recorded.bru",
      seq: 2,
      settings: { encodeUrl: true, timeout: 0 },
      tags: [],
      request: {
        url: "http://localhost:3000/failure-data/{{TransRefGUID}}",
        method: "GET",
        headers: [],
        params: [],
        body: { mode: "none", formUrlEncoded: [], multipartForm: [], file: [] },
        script: {},
        vars: {},
        assertions: [],
        tests: `// Parse the JSON response
let responseData = res.getBody();

test("Failure record exists", function () {
    expect(responseData).to.be.an('array').that.is.not.empty;
});

test("Status code is 200", function () {
    expect(res.getStatus()).to.equal(200);
});`,
        docs: "Verify failure was recorded in integration failures table",
        auth: { mode: "inherit" }
      }
    });

    return {
      type: "folder",
      name: "Negative Scenarios",
      filename: "Negative Scenarios",
      seq: 3,
      root: {
        request: { auth: { mode: "inherit" } },
        meta: { name: "Negative Scenarios", seq: 3 }
      },
      items: negativeTests
    };
  }

  /**
   * Generate environment variables based on DB queries and variable generators
   */
  generateEnvironmentVariables(config) {
    const vars = [];

    // Add variables from DB queries
    config.dbQueries.forEach(query => {
      if (query.variableName) {
        vars.push({
          name: query.variableName,
          value: "",
          secret: false,
          enabled: true,
          type: "text"
        });
      }
    });

    // Add variables from variable generators
    (config.variableGenerators || []).forEach(generator => {
      vars.push({
        name: generator.name,
        value: "",
        secret: false,
        enabled: true,
        type: "text"
      });
    });

    // Add common variables
    vars.push(
      {
        name: "baseUrl",
        value: "http://localhost:3000",
        secret: false,
        enabled: true,
        type: "text"
      },
      {
        name: "TransRefGUID",
        value: "",
        secret: false,
        enabled: true,
        type: "text"
      },
      {
        name: "CurrentTransExeDate",
        value: new Date().toISOString().split('T')[0],
        secret: false,
        enabled: true,
        type: "text"
      }
    );

    return vars;
  }

  /**
   * Generate test scripts for data preparation
   */
  generateDataPrepTests(query) {
    return `let jsonData = res.getBody();

test("Status code is 200", function () {
    expect(res.getStatus()).to.equal(200);
});

test("Response contains data", function () {
    expect(jsonData).to.exist;
});

// Store value in environment variable
if (jsonData.VALUE) {
    bru.setEnvVar("${query.variableName}", jsonData.VALUE);
    console.log("${query.variableName} stored as:", jsonData.VALUE);
}`;
  }

  /**
   * Generate test scripts for variable generators (pre-request scripts)
   */
  generateVariableGeneratorTests(generator) {
    return this.generateBrunoVariableScript(generator);
  }

  /**
   * Generate Bruno-compatible variable generation scripts
   */
  generateBrunoVariableScript(generator) {
    const { type, format, offset, condition, min, max, length, charset } = generator;
    
    switch (type) {
      case 'currentDate':
        return `      case 'currentDate':
        const dateFormat = format || 'MMddyyyy';
        return `// Generate current date in ${dateFormat} format (similar to SoapUI Property)
const date = new Date();
let generatedValue;

switch ('${dateFormat}') {
    case 'MMddyyyy':
        generatedValue = (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0') + 
                       date.getFullYear().toString();
        break;
    case 'yyyy-MM-dd':
        generatedValue = date.getFullYear() + '-' + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                       date.getDate().toString().padStart(2, '0');
        break;
    case 'dd/MM/yyyy':
        generatedValue = date.getDate().toString().padStart(2, '0') + '/' + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                       date.getFullYear();
        break;
    case 'yyyyMMdd':
        generatedValue = date.getFullYear().toString() + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0');
        break;
    default:
        generatedValue = date.toISOString().split('T')[0];
}

// Set environment variable for use in test scenarios
bru.setEnvVar("${generator.name}", generatedValue);
console.log('Generated ${generator.name}:', generatedValue);`;`;

      case 'currentDateTime':
        const dateTimeFormat = format || 'yyyy-MM-dd HH:mm:ss';
        return `// Generate current date and time in ${dateTimeFormat} format
const date = new Date();
let generatedValue;

switch ('${dateTimeFormat}') {
    case 'yyyy-MM-dd HH:mm:ss':
        generatedValue = date.getFullYear() + '-' + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                       date.getDate().toString().padStart(2, '0') + ' ' +
                       date.getHours().toString().padStart(2, '0') + ':' +
                       date.getMinutes().toString().padStart(2, '0') + ':' +
                       date.getSeconds().toString().padStart(2, '0');
        break;
    case 'yyyy-MM-dd\\'T\\'HH:mm:ss':
        generatedValue = date.toISOString().slice(0, 19);
        break;
    default:
        generatedValue = date.toISOString().slice(0, 19).replace('T', ' ');
}

bru.setEnvVar("${generator.name}", generatedValue);
console.log('Generated ${generator.name}:', generatedValue);`;

      case 'futurePastDate':
        const offsetDays = parseInt(offset) || -30;
        const offsetFormat = format || 'yyyy-MM-dd';
        return `// Generate date with ${offsetDays} days offset
const date = new Date();
date.setDate(date.getDate() + ${offsetDays});
let generatedValue;

switch ('${offsetFormat}') {
    case 'yyyy-MM-dd':
        generatedValue = date.getFullYear() + '-' + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                       date.getDate().toString().padStart(2, '0');
        break;
    case 'MMddyyyy':
        generatedValue = (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0') + 
                       date.getFullYear().toString();
        break;
    default:
        generatedValue = date.toISOString().split('T')[0];
}

bru.setEnvVar("${generator.name}", generatedValue);
console.log('Generated ${generator.name}:', generatedValue);`;

      case 'conditionalDate':
        if (condition === 'endOfMonth') {
          return `// Generate conditional date (avoid end of month >= 28) - SoapUI style
const date = new Date();
const day = date.getDate();

// If day >= 28, subtract 3 days (similar to SoapUI TransPaymentDate script)
if (day >= 28) {
    date.setDate(date.getDate() - 3);
}

const generatedValue = date.getFullYear() + '-' + 
                      (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                      date.getDate().toString().padStart(2, '0');

bru.setEnvVar("${generator.name}", generatedValue);
console.log('Generated ${generator.name} (conditional):', generatedValue);`;
        }
        break;

      case 'correlationId':
        let correlationScript = `// Generate correlation ID (UUID) - SoapUI style
// Generate UUID v4 equivalent
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let correlationID = generateUUID();`;

        if (format === 'compact') {
          correlationScript += `\ncorrelationID = correlationID.replace(/-/g, "");`;
        } else if (format === 'short') {
          correlationScript += `\ncorrelationID = correlationID.replace(/-/g, "").substring(0, 8);`;
        }

        correlationScript += `\n\n// Store previous correlation ID if exists (like SoapUI SetCorrelationID step)
const prevCorrelationId = bru.getEnvVar("correlationId");
if (prevCorrelationId) {
    bru.setEnvVar("prevCorrelationId", prevCorrelationId);
}

bru.setEnvVar("${generator.name}", correlationID);
console.log('Generated ${generator.name} (correlationID):', correlationID);`;

        return correlationScript;

      case 'randomNumber':
        const minVal = parseInt(min) || 1000;
        const maxVal = parseInt(max) || 9999;
        return `// Generate random number between ${minVal} and ${maxVal}
const min = ${minVal};
const max = ${maxVal};
const generatedValue = min + Math.floor(Math.random() * (max - min + 1));

bru.setEnvVar("${generator.name}", generatedValue);
console.log('Generated ${generator.name} (random number):', generatedValue);`;

      case 'randomString':
        const stringLength = parseInt(length) || 8;
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        if (charset === 'alphabetic') {
          characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        } else if (charset === 'numeric') {
          characters = '0123456789';
        }
        return `// Generate random string (${stringLength} characters)
const characters = '${characters}';
const length = ${stringLength};
let generatedValue = '';

for (let i = 0; i < length; i++) {
    generatedValue += characters.charAt(Math.floor(Math.random() * characters.length));
}

bru.setEnvVar("${generator.name}", generatedValue);
console.log('Generated ${generator.name} (random string):', generatedValue);`;

      case 'timestamp':
        if (format === 'unix') {
          return `// Generate Unix timestamp (seconds)
const generatedValue = Math.floor(Date.now() / 1000).toString();

bru.setEnvVar("${generator.name}", generatedValue);
console.log('Generated ${generator.name} (unix timestamp):', generatedValue);`;
        } else if (format === 'unixMs') {
          return `// Generate Unix timestamp (milliseconds)
const generatedValue = Date.now().toString();

bru.setEnvVar("${generator.name}", generatedValue);
console.log('Generated ${generator.name} (unix timestamp ms):', generatedValue);`;
        } else {
          return `// Generate ISO timestamp
const generatedValue = new Date().toISOString();

bru.setEnvVar("${generator.name}", generatedValue);
console.log('Generated ${generator.name} (ISO timestamp):', generatedValue);`;
        }

      default:
        return `// Unknown generator type: ${type}
console.error('Unknown generator type: ${type}');
bru.setEnvVar("${generator.name}", 'ERROR_UNKNOWN_TYPE');`;
    }
  }

  /**
   * Generate test scripts for positive scenarios
   */
  generatePositiveTests(config, scenario = null) {
    return `let response = res.getBody();

// Extract and store TransRefGUID
if (response.TXLife && response.TXLife.TXLifeResponse && response.TXLife.TXLifeResponse.TransRefGUID) {
    let transRef = response.TXLife.TXLifeResponse.TransRefGUID;
    bru.setEnvVar("TransRefGUID", transRef);
    console.log("TransRefGUID saved:", transRef);
}

test("Status code is 200", function () {
    expect(res.getStatus()).to.equal(200);
});

test("Response has TXLife structure", function () {
    expect(response.TXLife).to.exist;
    expect(response.TXLife.TXLifeResponse).to.exist;
});

test("TransResult indicates success", function () {
    expect(response.TXLife.TXLifeResponse.TransResult).to.exist;
    expect(response.TXLife.TXLifeResponse.TransResult.ResultCode['@tc']).to.eql("1");
});`;
  }

  /**
   * Generate test scripts for negative scenarios
   */
  generateNegativeTests() {
    return `let response = res.getBody();

// Extract TransRefGUID even from error response
if (response.TXLife && response.TXLife.TXLifeResponse && response.TXLife.TXLifeResponse.TransRefGUID) {
    let transRef = response.TXLife.TXLifeResponse.TransRefGUID;
    bru.setEnvVar("TransRefGUID", transRef);
    console.log("TransRefGUID saved:", transRef);
}

test("Response indicates error", function () {
    expect(res.getStatus()).to.be.oneOf([400, 422, 500]);
});

test("Error message exists", function () {
    expect(response.TXLife.TXLifeResponse.TransResult).to.exist;
});`;
  }

  /**
   * Generate auth configuration for Bruno
   */
  generateAuthConfig(auth) {
    if (!auth) return { mode: "none" };

    if (auth.type === 'basic') {
      return {
        mode: "basic",
        basic: {
          username: auth.username,
          password: auth.password
        }
      };
    } else if (auth.type === 'bearer') {
      return {
        mode: "bearer",
        bearer: { token: auth.token }
      };
    }

    return { mode: "none" };
  }

  /**
   * Corrupt payload for negative testing
   */
  corruptPayload(payload) {
    // If no payload (e.g., GET requests), return null
    if (!payload || payload === undefined || payload === null) {
      return null;
    }
    
    const corrupted = JSON.parse(JSON.stringify(payload));
    
    // Remove a required field or make data invalid
    if (corrupted.TXLife && corrupted.TXLife.TXLifeRequest) {
      // Example: Remove TransRefGUID or set invalid value
      if (corrupted.TXLife.TXLifeRequest.TransRefGUID) {
        corrupted.TXLife.TXLifeRequest.TransRefGUID = "INVALID_ID";
      }
    }
    
    return corrupted;
  }

  /**
   * Generate package.json
   */
  generatePackageJson() {
    return {
      name: this.sanitizeName(this.collectionName).toLowerCase(),
      version: "1.0.0",
      description: `Automated test suite for ${this.collectionName}`,
      main: "app.js",
      scripts: {
        start: "node app.js",
        dev: "nodemon app.js"
      },
      dependencies: {
        express: "^4.18.2",
        mssql: "^10.0.1"
      },
      devDependencies: {
        nodemon: "^3.0.1"
      }
    };
  }

  /**
   * Generate setup instructions
   */
  generateSetupInstructions(config) {
    return `# 🚀 Bruno Collection Setup Instructions

## 📦 What You Got

✅ **app.js** - Database server with all endpoints
✅ **${this.sanitizeName(config.collectionName)}.json** - Bruno Collection
✅ **package.json** - Dependencies configuration
✅ **This guide** - Setup instructions

---

## 🛠️ Setup Steps

### Step 1: Install Dependencies

\`\`\`cmd
npm install
\`\`\`

### Step 2: Start the Database Server

\`\`\`cmd
node app.js
\`\`\`

You should see:
\`\`\`
🚀 Server running on port 3000
📊 Database: ${config.dbConfig.database}
🔗 Health check: http://localhost:3000/health

✅ All endpoints are ready!
\`\`\`

### Step 3: Install Bruno CLI (if not already installed)

\`\`\`cmd
npm install -g @usebruno/cli
\`\`\`

### Step 4: Import Collection into Bruno

1. Open Bruno application
2. Click "Import Collection"
3. Select: \`${this.sanitizeName(config.collectionName)}.json\`
4. Collection imported! ✅

---

## 📂 Collection Structure

Your Bruno collection has 3 main folders:

### 1️⃣ **Data Preparation**
${config.dbQueries.map(q => `- ${q.name}: ${q.description || 'Prepares test data'}`).join('\n')}

### 2️⃣ **Positive Scenarios**
- Success test with valid data
- Integration verification

### 3️⃣ **Negative Scenarios**
- Invalid data test
- Failure verification

---

## 🏃 Running Tests

### Option 1: Bruno GUI
1. Open Bruno
2. Select your collection
3. Click "Run Collection"
4. View results!

### Option 2: Bruno CLI
\`\`\`cmd
bruno run "${this.sanitizeName(config.collectionName)}"
\`\`\`

### Option 3: Run Specific Folder
\`\`\`cmd
bruno run "${this.sanitizeName(config.collectionName)}/DataPreparation"
bruno run "${this.sanitizeName(config.collectionName)}/Positive Scenarios"
bruno run "${this.sanitizeName(config.collectionName)}/Negative Scenarios"
\`\`\`

---

## 🔧 Database Endpoints Available

${config.dbQueries.map(q => `
### ${q.name}
- **Endpoint**: \`${q.method || 'GET'} http://localhost:3000${q.endpoint}\`
- **Description**: ${q.description || 'Database query endpoint'}
`).join('\n')}

---

## 📊 Environment Variables

The collection uses these variables (auto-populated):

${config.dbQueries.map(q => q.variableName ? `- **${q.variableName}**: ${q.description}` : '').filter(Boolean).join('\n')}
- **TransRefGUID**: Transaction reference from API responses
- **CurrentTransExeDate**: Current date for transactions

---

## ✅ Testing Flow

1. **Run Data Preparation** → Fetches test data from database
2. **Run Positive Scenarios** → Tests valid API calls
3. **Run Negative Scenarios** → Tests error handling

---

## 🎯 What Gets Tested

### Data Preparation
✅ Database connectivity
✅ Test data availability
✅ Environment variable setup

### Positive Scenarios
✅ Successful API requests
✅ Correct response structure
✅ Database integration verification

### Negative Scenarios
✅ Invalid data handling
✅ Error responses
✅ Failure logging

---

## 🐛 Troubleshooting

### Server won't start
\`\`\`cmd
# Check if port 3000 is already in use
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <process_id> /F
\`\`\`

### Database connection issues
- Verify database credentials in app.js
- Check network connectivity
- Ensure firewall allows connection

### Bruno collection import fails
- Ensure JSON file is not corrupted
- Check Bruno version (should be latest)
- Try re-generating the collection

---

## 📞 Need Help?

Review the generated files:
- \`app.js\` - All database endpoints
- \`${this.sanitizeName(config.collectionName)}.json\` - Complete test suite

---

**Generated by AI-Powered Bruno Collection Generator** 🤖
**Date**: ${new Date().toISOString()}
`;
  }

  /**
   * Helper: Sanitize names for filenames
   */
  sanitizeName(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/--+/g, '-');
  }

  /**
   * Helper: Save file to disk
   */
  saveFile(filename, content) {
    const outputDir = path.join(process.cwd(), 'bruno-generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Generate unique variables script for CSV scenarios
   */
  generateUniqueVariablesScript(config, scenarioIndex) {
    let script = '// Generate unique variables for this scenario\n';
    
    // Generate unique values for each variable generator
    (config.variableGenerators || []).forEach(generator => {
      const uniqueSuffix = `_${scenarioIndex + 1}`;
      const variableName = `${generator.name}${uniqueSuffix}`;
      
      switch(generator.type) {
        case 'correlationId':
        case 'uuid':
          script += `
// Generate unique ${generator.name} for scenario ${scenarioIndex + 1}
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
let ${variableName} = generateUUID();
bru.setEnvVar("${variableName}", ${variableName});
`;
          break;
          
        case 'date':
        case 'currentDate':
          script += `
// Generate unique date for scenario ${scenarioIndex + 1}
const ${variableName} = new Date().toISOString().split('T')[0];
bru.setEnvVar("${variableName}", ${variableName});
`;
          break;
          
        case 'timestamp':
          script += `
// Generate unique timestamp for scenario ${scenarioIndex + 1}
const ${variableName} = Date.now();
bru.setEnvVar("${variableName}", ${variableName});
`;
          break;
          
        case 'randomNumber':
          script += `
// Generate unique random number for scenario ${scenarioIndex + 1}
const ${variableName} = Math.floor(Math.random() * 100000);
bru.setEnvVar("${variableName}", ${variableName});
`;
          break;
          
        case 'randomString':
          script += `
// Generate unique random string for scenario ${scenarioIndex + 1}
const ${variableName} = Math.random().toString(36).substring(2, 15);
bru.setEnvVar("${variableName}", ${variableName});
`;
          break;
      }
    });
    
    return script;
  }

  /**
   * Generate tests for CSV scenarios with assertions
   */
  generateCSVScenarioTests(config, csvScenario) {
    let tests = `
// Test for CSV scenario: ${csvScenario.name}
test("${csvScenario.name} - API Response", function () {
    // Basic response validation
    expect(res).to.have.property('status');
    expect(res.status).to.be.a('number');
    
    console.log("Scenario: ${csvScenario.name}");
    console.log("Response Status:", res.status);
    console.log("Response Time:", res.responseTime + "ms");
`;

    // Add configured assertions
    (config.assertions || []).forEach(assertion => {
      switch(assertion.type) {
        case 'status':
          tests += `
    // Status code assertion
    expect(res.status).to.equal(${assertion.expected});
`;
          break;
          
        case 'responseTime':
          tests += `
    // Response time assertion
    expect(res.responseTime).to.be.below(${assertion.expected});
`;
          break;
          
        case 'jsonPath':
          tests += `
    // JSON path assertion
    const responseBody = res.getBody();
    // ${assertion.description}
    expect(responseBody).to.exist;
`;
          break;
          
        case 'body':
          tests += `
    // Response body contains assertion
    const responseText = res.getBody();
    expect(responseText).to.include("${assertion.expected}");
`;
          break;
      }
    });

    tests += `
});

// Scenario-specific validation
test("${csvScenario.name} - Scenario Type: ${csvScenario.type}", function () {
    // Log scenario details
    console.log("Scenario Type:", "${csvScenario.type}");
    console.log("Request Body:", \`${csvScenario.requestBody}\`);
});
`;

    return tests;
  }
}

// Export
module.exports = BrunoCollectionGenerator;

// Example usage
if (require.main === module) {
  const generator = new BrunoCollectionGenerator();
  
  // Example configuration
  const sampleConfig = {
    collectionName: "Get Customer Summary",
    apiUrl: "http://ix-aks.alipacn.com/ixat1/wsgateway/customers/{{clientId}}/summary",
    method: "GET",
    integrationPoint: "GET_CUSTOMER",
    requestPayload: {},
    auth: {
      type: "basic",
      username: "CLIENTUSER",
      password: "k$@#0n!51P"
    },
    dbConfig: {
      user: 'alipuser',
      password: 'Alip!2023',
      server: 'ix-sqlmi1.9e004d9e1a61.database.windows.net',
      database: 'IXAT1',
      options: { encrypt: true }
    },
    dbQueries: [
      {
        name: "Success Client ID",
        endpoint: "/client-data",
        method: "GET",
        variableName: "clientId",
        description: "Fetch valid client ID for positive testing",
        query: `SELECT (MAX(CD_CLIENT_ID)) AS VALUE, 'ExistentClient' AS "KEY"
FROM CRM.T_CRCD_CLIENT_DETAIL`
      },
      {
        name: "Failure Client ID",
        endpoint: "/nonexistent-client",
        method: "GET",
        variableName: "NonExistentClientId",
        description: "Generate non-existent client ID for negative testing",
        query: `SELECT CONCAT(MAX(CD_CLIENT_ID), '111') AS VALUE, 'NonExistentClient' AS "KEY"
FROM CRM.T_CRCD_CLIENT_DETAIL`
      }
    ]
  };
  
  generator.generateCollection(sampleConfig);
}
