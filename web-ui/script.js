// Global state
let currentStep = 1;
let queryCount = 0;
let scenarioCount = 0;
let variableGeneratorCount = 0;
let generatedFiles = {};
let csvScenarios = [];

// Helper function to safely parse JSON
function tryParseJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn('Failed to parse JSON:', jsonString);
        return null;
    }
}

// Download diagnostics function
function diagnoseDownloadIssues() {
    console.log('🔍 Download Diagnostics:');
    console.log('Browser:', navigator.userAgent);
    console.log('Download support:', {
        'HTML5 Download': 'download' in document.createElement('a'),
        'Blob Support': typeof Blob !== 'undefined',
        'URL.createObjectURL': typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function',
        'msSaveOrOpenBlob': typeof navigator.msSaveOrOpenBlob === 'function'
    });
    
    // Test if downloads folder is accessible
    try {
        const testBlob = new Blob(['test'], { type: 'text/plain' });
        const testUrl = URL.createObjectURL(testBlob);
        console.log('Blob creation: ✅ Success');
        URL.revokeObjectURL(testUrl);
    } catch (e) {
        console.log('Blob creation: ❌ Failed -', e.message);
    }
    
    return {
        canDownload: 'download' in document.createElement('a') && typeof Blob !== 'undefined',
        browserInfo: navigator.userAgent,
        downloadFolder: 'Check browser settings for default download location'
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    addVariableGenerator(); // Add first variable generator by default
    addQuery(); // Add first query by default
    addScenario(); // Add first scenario by default
});

// Step Navigation
function nextStep(step) {
    if (validateStep(step)) {
        currentStep = step + 1;
        updateStepDisplay();
        
        if (currentStep === 3) {
            updateAvailableVariables(); // Update variable reference when entering scenarios step
        }
        
        if (currentStep === 5) {
            showConfigPreview();
        }
    }
}

function prevStep(step) {
    currentStep = step - 1;
    updateStepDisplay();
}

function updateStepDisplay() {
    // Hide all sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current section
    document.getElementById('step' + currentStep).classList.add('active');
    
    // Update progress steps
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNum = index + 1;
        if (stepNum < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Validation
function validateStep(step) {
    switch(step) {
        case 1:
            const collectionName = document.getElementById('collectionName').value.trim();
            if (!collectionName) {
                alert('Please enter a collection name');
                return false;
            }
            return true;
            
        case 2:
            // Validate database connection details
            const jdbcUrl = document.getElementById('jdbcUrl').value.trim();
            const dbUsername = document.getElementById('dbUsername').value.trim();
            const dbPassword = document.getElementById('dbPassword').value.trim();
            
            if (!jdbcUrl || !dbUsername || !dbPassword) {
                alert('Please fill in all database connection fields (JDBC URL, Username, Password)');
                return false;
            }

            // Validate variable generators
            const generators = getVariableGenerators();
            for (let i = 0; i < generators.length; i++) {
                if (!generators[i].name || !generators[i].type) {
                    alert(`Please fill in all fields for Variable Generator #${i + 1}`);
                    return false;
                }
                
                // Type-specific validation
                if (generators[i].type === 'randomNumber') {
                    if (!generators[i].min || !generators[i].max) {
                        alert(`Please specify min and max values for Random Number Generator #${i + 1}`);
                        return false;
                    }
                    if (parseInt(generators[i].min) >= parseInt(generators[i].max)) {
                        alert(`Min value must be less than max value for Random Number Generator #${i + 1}`);
                        return false;
                    }
                }
                
                if (generators[i].type === 'randomString' && (!generators[i].length || parseInt(generators[i].length) <= 0)) {
                    alert(`Please specify a valid length for Random String Generator #${i + 1}`);
                    return false;
                }
            }
            
            // Validate at least one query or generator
            const queries = getQueries();
            if (queries.length === 0 && generators.length === 0) {
                alert('Please add at least one database query or variable generator');
                return false;
            }
            
            // Validate each query has required fields
            for (let i = 0; i < queries.length; i++) {
                if (!queries[i].name || !queries[i].query) {
                    alert(`Please fill in all fields for Query #${i + 1}`);
                    return false;
                }
            }
            return true;
            
        case 3:
            // Validate at least one scenario (manual or CSV)
            const scenarios = getScenarios();
            const csvScenariosCount = csvScenarios ? csvScenarios.length : 0;
            
            console.log('Validation Debug:', {
                manualScenarios: scenarios.length,
                csvScenarios: csvScenariosCount,
                csvData: csvScenarios
            });
            
            if (scenarios.length === 0 && csvScenariosCount === 0) {
                alert('Please add at least one test scenario or upload a CSV file with scenarios');
                return false;
            }
            
            // If we have CSV scenarios, that's sufficient - no need for manual scenarios
            if (csvScenariosCount > 0) {
                console.log('✅ CSV scenarios found, skipping manual scenario validation');
                // Validate CSV scenarios have required fields
                for (let i = 0; i < csvScenarios.length; i++) {
                    if (!csvScenarios[i].name || !csvScenarios[i].requestBody) {
                        alert(`CSV Scenario #${i + 1} is missing required fields (name or request body)`);
                        return false;
                    }
                }
                return true; // CSV scenarios are valid, proceed
            }
            
            // Only validate manual scenarios if no CSV scenarios exist
            for (let i = 0; i < scenarios.length; i++) {
                if (!scenarios[i].name || !scenarios[i].url) {
                    alert(`Please fill in required fields (Name and URL) for Scenario #${i + 1}`);
                    return false;
                }
                if (!isValidUrl(scenarios[i].url.replace(/\{\{.*?\}\}/g, 'placeholder'))) {
                    alert(`Please enter a valid URL for Scenario #${i + 1}`);
                    return false;
                }
            }
            
            // Validate CSV scenarios have required fields
            if (csvScenariosCount > 0) {
                for (let i = 0; i < csvScenarios.length; i++) {
                    if (!csvScenarios[i].name || !csvScenarios[i].requestBody) {
                        alert(`CSV Scenario #${i + 1} is missing required fields (name or request body)`);
                        return false;
                    }
                }
            }
            return true;
            
        case 4:
            const authType = document.getElementById('authType').value;
            if (authType === 'basic') {
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();
                if (!username || !password) {
                    alert('Please enter username and password for Basic Auth');
                    return false;
                }
            } else if (authType === 'bearer') {
                const token = document.getElementById('bearerToken').value.trim();
                if (!token) {
                    alert('Please enter a Bearer token');
                    return false;
                }
            }
            return true;
            
        default:
            return true;
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Authentication Toggle
function toggleAuthFields() {
    const authType = document.getElementById('authType').value;
    const basicFields = document.getElementById('basicAuthFields');
    const bearerFields = document.getElementById('bearerTokenFields');
    
    if (authType === 'basic') {
        basicFields.style.display = 'block';
        bearerFields.style.display = 'none';
    } else if (authType === 'bearer') {
        basicFields.style.display = 'none';
        bearerFields.style.display = 'block';
    } else {
        basicFields.style.display = 'none';
        bearerFields.style.display = 'none';
    }
}

function togglePassword() {
    const passwordField = document.getElementById('password');
    const btn = event.target;
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        btn.textContent = '🙈 Hide';
    } else {
        passwordField.type = 'password';
        btn.textContent = '👁️ Show';
    }
}

function toggleDbPassword() {
    const passwordField = document.getElementById('dbPassword');
    const btn = event.target;
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        btn.textContent = '🙈 Hide';
    } else {
        passwordField.type = 'password';
        btn.textContent = '👁️ Show';
    }
}

// Database Type Handler
function handleDbTypeChange() {
    const dbType = document.getElementById('dbType').value;
    const mssqlConfig = document.getElementById('mssqlConfig');
    const h2Config = document.getElementById('h2Config');
    
    if (dbType === 'h2') {
        mssqlConfig.style.display = 'none';
        h2Config.style.display = 'block';
    } else {
        mssqlConfig.style.display = 'block';
        h2Config.style.display = 'none';
    }
}

// JSON Formatting
function formatJSON(elementId) {
    const textarea = document.getElementById(elementId);
    try {
        const json = JSON.parse(textarea.value);
        textarea.value = JSON.stringify(json, null, 2);
    } catch (e) {
        alert('Invalid JSON format. Please check your syntax.');
    }
}

// Database Queries Management
function addQuery() {
    queryCount++;
    const container = document.getElementById('queriesContainer');
    
    const queryItem = document.createElement('div');
    queryItem.className = 'query-item';
    queryItem.id = 'query-' + queryCount;
    queryItem.innerHTML = `
        <div class="query-header">
            <div class="query-title">📊 Database Query #${queryCount}</div>
            <button class="remove-query" onclick="removeQuery(${queryCount})">×</button>
        </div>
        
        <div class="form-group">
            <label for="queryName-${queryCount}">Query Name/Description *</label>
            <input type="text" id="queryName-${queryCount}" placeholder="e.g., Get Latest Contract ID for DA Plan">
            <small>Descriptive name for this database query</small>
        </div>
        
        <div class="form-group">
            <label for="querySQL-${queryCount}">SQL Query (KEY-VALUE Format) *</label>
            <textarea id="querySQL-${queryCount}" rows="6" placeholder="SELECT MAX(LIPC.PC_CONT) AS VALUE, 'Contract_DA' AS KEY 
FROM PRODUCT.T_LIPC_POLICY_COMMON LIPC 
WHERE LIPC.PC_PLN_CODE='864' 
  AND LIPC.PC_STATUS='A' 
  AND LIPC.PC_POL_NUM NOT IN (
    SELECT LIPX.PX_EXCH_CHILD_POL_NUM 
    FROM DBO.T_LIPX_POLICY_EXCHANGE LIPX
  )"></textarea>
            <small>⚠️ <strong>Important:</strong> Query must return columns named 'KEY' and 'VALUE'</small>
        </div>
        
        <div class="query-example">
            <h4>✅ Query Format Example:</h4>
            <code>SELECT MAX(LIPC.PC_CONT) AS VALUE, 'Contract_DA' AS KEY
FROM PRODUCT.T_LIPC_POLICY_COMMON LIPC 
WHERE LIPC.PC_PLN_CODE='864' AND LIPC.PC_STATUS='A'
UNION
SELECT MAX(LIPC.PC_CONT) AS VALUE, 'Contract_IA' AS KEY  
FROM PRODUCT.T_LIPC_POLICY_COMMON LIPC 
WHERE LIPC.PC_PLN_CODE='855' AND LIPC.PC_STATUS='P'</code>
        </div>
    `;
    
    container.appendChild(queryItem);
}

function removeQuery(id) {
    const queryItem = document.getElementById('query-' + id);
    if (queryItem) {
        queryItem.remove();
    }
}

// Variable Generators Management
function addVariableGenerator() {
    variableGeneratorCount++;
    const container = document.getElementById('variableGeneratorsContainer');
    
    const generatorItem = document.createElement('div');
    generatorItem.className = 'generator-item';
    generatorItem.id = 'generator-' + variableGeneratorCount;
    generatorItem.innerHTML = `
        <div class="generator-header">
            <div class="generator-title">🎲 Variable Generator #${variableGeneratorCount}</div>
            <button class="remove-generator" onclick="removeVariableGenerator(${variableGeneratorCount})">×</button>
        </div>
        
        <div class="form-group">
            <label for="generatorName-${variableGeneratorCount}">Variable Name *</label>
            <input type="text" id="generatorName-${variableGeneratorCount}" placeholder="e.g., CurrentDate, correlationId, TransPaymentDate">
            <small>Name to use in scenarios: {{Variable_Name}}</small>
        </div>
        
        <div class="form-group">
            <label for="generatorType-${variableGeneratorCount}">Generator Type *</label>
            <select id="generatorType-${variableGeneratorCount}" onchange="updateGeneratorOptions(${variableGeneratorCount})">
                <option value="">Select Generator Type</option>
                <option value="currentDate">Current Date</option>
                <option value="currentDateTime">Current Date & Time</option>
                <option value="futurePastDate">Future/Past Date</option>
                <option value="conditionalDate">Conditional Date</option>
                <option value="correlationId">Correlation ID (UUID)</option>
                <option value="randomNumber">Random Number</option>
                <option value="randomString">Random String</option>
                <option value="timestamp">Timestamp</option>
            </select>
        </div>
        
        <div id="generatorOptions-${variableGeneratorCount}" class="generator-options">
            <!-- Dynamic options will be inserted here -->
        </div>
        
        <div class="generator-preview">
            <h4>📝 Generated Script Preview:</h4>
            <pre id="generatorPreview-${variableGeneratorCount}">Select a generator type to see the script</pre>
        </div>
    `;
    
    container.appendChild(generatorItem);
}

function removeVariableGenerator(id) {
    const generatorItem = document.getElementById('generator-' + id);
    if (generatorItem) {
        generatorItem.remove();
    }
}

function updateGeneratorOptions(id) {
    const generatorType = document.getElementById(`generatorType-${id}`).value;
    const optionsContainer = document.getElementById(`generatorOptions-${id}`);
    const previewContainer = document.getElementById(`generatorPreview-${id}`);
    
    let optionsHTML = '';
    let previewScript = '';
    
    switch (generatorType) {
        case 'currentDate':
            optionsHTML = `
                <div class="form-group">
                    <label>Date Format *</label>
                    <select id="generatorFormat-${id}" onchange="updateGeneratorPreview(${id})">
                        <option value="MMddyyyy">MM/dd/yyyy (e.g., 11252025)</option>
                        <option value="yyyy-MM-dd">yyyy-MM-dd (e.g., 2025-11-25)</option>
                        <option value="dd/MM/yyyy">dd/MM/yyyy (e.g., 25/11/2025)</option>
                        <option value="yyyyMMdd">yyyyMMdd (e.g., 20251125)</option>
                    </select>
                </div>
            `;
            previewScript = `def dtformat = new java.text.SimpleDateFormat("MMddyyyy")
return dtformat.format(new java.util.Date())`;
            break;
            
        case 'currentDateTime':
            optionsHTML = `
                <div class="form-group">
                    <label>DateTime Format *</label>
                    <select id="generatorFormat-${id}" onchange="updateGeneratorPreview(${id})">
                        <option value="yyyy-MM-dd HH:mm:ss">yyyy-MM-dd HH:mm:ss</option>
                        <option value="yyyy-MM-dd'T'HH:mm:ss">ISO Format (yyyy-MM-ddTHH:mm:ss)</option>
                        <option value="MMddyyyy HH:mm:ss">MMddyyyy HH:mm:ss</option>
                        <option value="dd/MM/yyyy HH:mm:ss">dd/MM/yyyy HH:mm:ss</option>
                    </select>
                </div>
            `;
            previewScript = `def dtformat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
return dtformat.format(new java.util.Date())`;
            break;
            
        case 'futurePastDate':
            optionsHTML = `
                <div class="form-group">
                    <label>Date Offset *</label>
                    <select id="generatorOffset-${id}" onchange="updateGeneratorPreview(${id})">
                        <option value="-30">30 days ago</option>
                        <option value="-7">7 days ago</option>
                        <option value="-1">Yesterday</option>
                        <option value="1">Tomorrow</option>
                        <option value="7">7 days from now</option>
                        <option value="30">30 days from now</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date Format *</label>
                    <select id="generatorFormat-${id}" onchange="updateGeneratorPreview(${id})">
                        <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                        <option value="MMddyyyy">MMddyyyy</option>
                        <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    </select>
                </div>
            `;
            previewScript = `def dtformat = new java.text.SimpleDateFormat("yyyy-MM-dd")
def calendar = Calendar.getInstance()
calendar.add(Calendar.DAY_OF_MONTH, -30)
return dtformat.format(calendar.getTime())`;
            break;
            
        case 'conditionalDate':
            optionsHTML = `
                <div class="form-group">
                    <label>Condition *</label>
                    <select id="generatorCondition-${id}" onchange="updateGeneratorPreview(${id})">
                        <option value="endOfMonth">Avoid end of month (if >= 28, subtract 3 days)</option>
                        <option value="weekday">Only weekdays (avoid weekends)</option>
                        <option value="monthEnd">Force month end</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date Format *</label>
                    <select id="generatorFormat-${id}" onchange="updateGeneratorPreview(${id})">
                        <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                        <option value="MMddyyyy">MMddyyyy</option>
                        <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    </select>
                </div>
            `;
            previewScript = `def dtformat = new java.text.SimpleDateFormat("yyyy-MM-dd")
def day = new java.text.SimpleDateFormat("dd")
if (Integer.parseInt(day.format(new java.util.Date())) >= 28) {
    return dtformat.format(new java.util.Date() - 3)
} else {
    return dtformat.format(new java.util.Date())
}`;
            break;
            
        case 'correlationId':
            optionsHTML = `
                <div class="form-group">
                    <label>UUID Format *</label>
                    <select id="generatorFormat-${id}" onchange="updateGeneratorPreview(${id})">
                        <option value="full">Full UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)</option>
                        <option value="compact">Compact UUID (no hyphens)</option>
                        <option value="short">Short ID (8 characters)</option>
                    </select>
                </div>
            `;
            previewScript = `def correlationID = String.valueOf(java.util.UUID.randomUUID())
testRunner.getTestCase().setPropertyValue("prevCorrelationId", context.testCase.getProperty("correlationId").value)
testRunner.getTestCase().setPropertyValue("correlationId", correlationID)
log.info("correlationID set to: " + context.testCase.getProperty("correlationId").value)
return correlationID`;
            break;
            
        case 'randomNumber':
            optionsHTML = `
                <div class="form-group">
                    <label>Number Range *</label>
                    <input type="number" id="generatorMin-${id}" placeholder="Min value (e.g., 1000)" onchange="updateGeneratorPreview(${id})">
                    <input type="number" id="generatorMax-${id}" placeholder="Max value (e.g., 9999)" onchange="updateGeneratorPreview(${id})">
                </div>
            `;
            previewScript = `def random = new Random()
def min = 1000
def max = 9999
return min + random.nextInt(max - min + 1)`;
            break;
            
        case 'randomString':
            optionsHTML = `
                <div class="form-group">
                    <label>String Length *</label>
                    <input type="number" id="generatorLength-${id}" placeholder="Length (e.g., 8)" value="8" onchange="updateGeneratorPreview(${id})">
                </div>
                <div class="form-group">
                    <label>Character Set *</label>
                    <select id="generatorCharset-${id}" onchange="updateGeneratorPreview(${id})">
                        <option value="alphanumeric">Alphanumeric (A-Z, 0-9)</option>
                        <option value="alphabetic">Alphabetic only (A-Z)</option>
                        <option value="numeric">Numeric only (0-9)</option>
                    </select>
                </div>
            `;
            previewScript = `def charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
def random = new Random()
def length = 8
def randomString = ""
for (int i = 0; i < length; i++) {
    randomString += charset.charAt(random.nextInt(charset.length()))
}
return randomString`;
            break;
            
        case 'timestamp':
            optionsHTML = `
                <div class="form-group">
                    <label>Timestamp Format *</label>
                    <select id="generatorFormat-${id}" onchange="updateGeneratorPreview(${id})">
                        <option value="unix">Unix Timestamp (seconds)</option>
                        <option value="unixMs">Unix Timestamp (milliseconds)</option>
                        <option value="iso">ISO 8601</option>
                    </select>
                </div>
            `;
            previewScript = `// Unix timestamp in seconds
return String.valueOf(System.currentTimeMillis() / 1000)`;
            break;
            
        default:
            previewScript = 'Select a generator type to see the script';
    }
    
    optionsContainer.innerHTML = optionsHTML;
    previewContainer.textContent = previewScript;
}

function updateGeneratorPreview(id) {
    const generatorType = document.getElementById(`generatorType-${id}`).value;
    const previewContainer = document.getElementById(`generatorPreview-${id}`);
    let script = '';
    
    switch (generatorType) {
        case 'currentDate':
            const dateFormat = document.getElementById(`generatorFormat-${id}`)?.value || 'MMddyyyy';
            script = `def dtformat = new java.text.SimpleDateFormat("${dateFormat}")
return dtformat.format(new java.util.Date())`;
            break;
            
        case 'currentDateTime':
            const dateTimeFormat = document.getElementById(`generatorFormat-${id}`)?.value || 'yyyy-MM-dd HH:mm:ss';
            script = `def dtformat = new java.text.SimpleDateFormat("${dateTimeFormat}")
return dtformat.format(new java.util.Date())`;
            break;
            
        case 'futurePastDate':
            const offset = document.getElementById(`generatorOffset-${id}`)?.value || '-30';
            const offsetFormat = document.getElementById(`generatorFormat-${id}`)?.value || 'yyyy-MM-dd';
            script = `def dtformat = new java.text.SimpleDateFormat("${offsetFormat}")
def calendar = Calendar.getInstance()
calendar.add(Calendar.DAY_OF_MONTH, ${offset})
return dtformat.format(calendar.getTime())`;
            break;
            
        case 'conditionalDate':
            const condition = document.getElementById(`generatorCondition-${id}`)?.value || 'endOfMonth';
            const condFormat = document.getElementById(`generatorFormat-${id}`)?.value || 'yyyy-MM-dd';
            
            if (condition === 'endOfMonth') {
                script = `def dtformat = new java.text.SimpleDateFormat("${condFormat}")
def day = new java.text.SimpleDateFormat("dd")
if (Integer.parseInt(day.format(new java.util.Date())) >= 28) {
    return dtformat.format(new java.util.Date() - 3)
} else {
    return dtformat.format(new java.util.Date())
}`;
            } else if (condition === 'weekday') {
                script = `def dtformat = new java.text.SimpleDateFormat("${condFormat}")
def calendar = Calendar.getInstance()
def dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK)
if (dayOfWeek == Calendar.SATURDAY) {
    calendar.add(Calendar.DAY_OF_MONTH, 2) // Move to Monday
} else if (dayOfWeek == Calendar.SUNDAY) {
    calendar.add(Calendar.DAY_OF_MONTH, 1) // Move to Monday
}
return dtformat.format(calendar.getTime())`;
            } else if (condition === 'monthEnd') {
                script = `def dtformat = new java.text.SimpleDateFormat("${condFormat}")
def calendar = Calendar.getInstance()
calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH))
return dtformat.format(calendar.getTime())`;
            }
            break;
            
        case 'correlationId':
            const uuidFormat = document.getElementById(`generatorFormat-${id}`)?.value || 'full';
            if (uuidFormat === 'full') {
                script = `def correlationID = String.valueOf(java.util.UUID.randomUUID())
testRunner.getTestCase().setPropertyValue("correlationId", correlationID)
log.info("correlationID set to: " + correlationID)
return correlationID`;
            } else if (uuidFormat === 'compact') {
                script = `def correlationID = String.valueOf(java.util.UUID.randomUUID()).replace("-", "")
testRunner.getTestCase().setPropertyValue("correlationId", correlationID)
log.info("correlationID set to: " + correlationID)
return correlationID`;
            } else if (uuidFormat === 'short') {
                script = `def correlationID = String.valueOf(java.util.UUID.randomUUID()).replace("-", "").substring(0, 8)
testRunner.getTestCase().setPropertyValue("correlationId", correlationID)
log.info("correlationID set to: " + correlationID)
return correlationID`;
            }
            break;
            
        case 'randomNumber':
            const min = document.getElementById(`generatorMin-${id}`)?.value || '1000';
            const max = document.getElementById(`generatorMax-${id}`)?.value || '9999';
            script = `def random = new Random()
def min = ${min}
def max = ${max}
return min + random.nextInt(max - min + 1)`;
            break;
            
        case 'randomString':
            const length = document.getElementById(`generatorLength-${id}`)?.value || '8';
            const charset = document.getElementById(`generatorCharset-${id}`)?.value || 'alphanumeric';
            let charSet = '';
            
            if (charset === 'alphanumeric') {
                charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            } else if (charset === 'alphabetic') {
                charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            } else if (charset === 'numeric') {
                charSet = '0123456789';
            }
            
            script = `def charset = "${charSet}"
def random = new Random()
def length = ${length}
def randomString = ""
for (int i = 0; i < length; i++) {
    randomString += charset.charAt(random.nextInt(charset.length()))
}
return randomString`;
            break;
            
        case 'timestamp':
            const timestampFormat = document.getElementById(`generatorFormat-${id}`)?.value || 'unix';
            if (timestampFormat === 'unix') {
                script = 'return String.valueOf(System.currentTimeMillis() / 1000)';
            } else if (timestampFormat === 'unixMs') {
                script = 'return String.valueOf(System.currentTimeMillis())';
            } else if (timestampFormat === 'iso') {
                script = `def dtformat = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
dtformat.setTimeZone(TimeZone.getTimeZone("UTC"))
return dtformat.format(new java.util.Date())`;
            }
            break;
    }
    
    previewContainer.textContent = script;
}

function getVariableGenerators() {
    const generators = [];
    const generatorItems = document.querySelectorAll('.generator-item');
    
    generatorItems.forEach(item => {
        const id = item.id.split('-')[1];
        const name = document.getElementById('generatorName-' + id).value.trim();
        const type = document.getElementById('generatorType-' + id).value;
        
        if (name && type) {
            const generator = {
                name: name,
                type: type
            };
            
            // Add type-specific options
            switch (type) {
                case 'currentDate':
                case 'currentDateTime':
                case 'futurePastDate':
                case 'conditionalDate':
                case 'timestamp':
                    generator.format = document.getElementById(`generatorFormat-${id}`)?.value;
                    break;
                case 'futurePastDate':
                    generator.offset = document.getElementById(`generatorOffset-${id}`)?.value;
                    break;
                case 'conditionalDate':
                    generator.condition = document.getElementById(`generatorCondition-${id}`)?.value;
                    break;
                case 'correlationId':
                    generator.format = document.getElementById(`generatorFormat-${id}`)?.value;
                    break;
                case 'randomNumber':
                    generator.min = document.getElementById(`generatorMin-${id}`)?.value;
                    generator.max = document.getElementById(`generatorMax-${id}`)?.value;
                    break;
                case 'randomString':
                    generator.length = document.getElementById(`generatorLength-${id}`)?.value;
                    generator.charset = document.getElementById(`generatorCharset-${id}`)?.value;
                    break;
            }
            
            generators.push(generator);
        }
    });
    
    return generators;
}

// Database Connection Testing
async function testDatabaseConnection() {
    const statusDiv = document.getElementById('dbConnectionStatus');
    const jdbcUrl = document.getElementById('jdbcUrl').value.trim();
    const username = document.getElementById('dbUsername').value.trim();
    const password = document.getElementById('dbPassword').value.trim();
    
    if (!jdbcUrl || !username || !password) {
        statusDiv.className = 'connection-status error';
        statusDiv.style.display = 'block';
        statusDiv.textContent = '❌ Please fill in all database connection fields';
        return;
    }
    
    statusDiv.className = 'connection-status testing';
    statusDiv.style.display = 'block';
    statusDiv.textContent = '🔄 Testing database connection...';
    
    try {
        // Send test connection request to server
        const response = await fetch('/api/test-db-connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jdbcUrl: jdbcUrl,
                username: username,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            statusDiv.className = 'connection-status success';
            statusDiv.textContent = '✅ Database connection successful!';
        } else {
            statusDiv.className = 'connection-status error';
            statusDiv.textContent = `❌ Connection failed: ${result.error}`;
        }
    } catch (error) {
        statusDiv.className = 'connection-status error';
        statusDiv.textContent = `❌ Connection test failed: ${error.message}`;
    }
}

// Test Scenarios Management
function addScenario() {
    scenarioCount++;
    const container = document.getElementById('scenariosContainer');
    
    const scenarioItem = document.createElement('div');
    scenarioItem.className = 'scenario-item';
    scenarioItem.id = 'scenario-' + scenarioCount;
    scenarioItem.innerHTML = `
        <div class="scenario-header">
            <div class="scenario-title">🧪 Test Scenario #${scenarioCount}</div>
            <button class="remove-scenario" onclick="removeScenario(${scenarioCount})">×</button>
        </div>
        
        <div class="form-group">
            <label for="scenarioName-${scenarioCount}">Scenario Name *</label>
            <input type="text" id="scenarioName-${scenarioCount}" placeholder="e.g., Get Contract Details - Valid DA Contract">
            <small>Descriptive name for this test scenario</small>
        </div>
        
        <div class="form-group">
            <label for="scenarioUrl-${scenarioCount}">API URL *</label>
            <input type="url" id="scenarioUrl-${scenarioCount}" placeholder="https://api.example.com/v1/contract/{{Contract_DA}}">
            <small>Use {{KEY_NAME}} to reference database variables</small>
        </div>
        
        <div class="form-group">
            <label for="scenarioMethod-${scenarioCount}">HTTP Method *</label>
            <select id="scenarioMethod-${scenarioCount}">
                <option value="GET">GET</option>
                <option value="POST" selected>POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="scenarioRequest-${scenarioCount}">Request Body (JSON)</label>
            <textarea id="scenarioRequest-${scenarioCount}" rows="8" placeholder='{
  "contractId": "{{Contract_DA}}",
  "planCode": "864",
  "requestType": "summary",
  "includeDetails": true
}'></textarea>
            <small>Use {{KEY_NAME}} to inject database values. Leave empty for GET requests.</small>
            <button type="button" class="btn btn-small btn-secondary" onclick="formatJSON('scenarioRequest-${scenarioCount}')">Format JSON</button>
        </div>
    `;
    
    container.appendChild(scenarioItem);
}

function removeScenario(id) {
    const scenarioItem = document.getElementById('scenario-' + id);
    if (scenarioItem) {
        scenarioItem.remove();
    }
}

function getQueries() {
    const queries = [];
    const queryItems = document.querySelectorAll('.query-item');
    
    queryItems.forEach(item => {
        const id = item.id.split('-')[1];
        const name = document.getElementById('queryName-' + id).value.trim();
        const sql = document.getElementById('querySQL-' + id).value.trim();
        
        if (name && sql) {
            queries.push({
                name: name,
                query: sql
            });
        }
    });
    
    return queries;
}

function getScenarios() {
    const scenarios = [];
    const scenarioItems = document.querySelectorAll('.scenario-item');
    
    scenarioItems.forEach(item => {
        const id = item.id.split('-')[1];
        const name = document.getElementById('scenarioName-' + id).value.trim();
        const url = document.getElementById('scenarioUrl-' + id).value.trim();
        const method = document.getElementById('scenarioMethod-' + id).value;
        const request = document.getElementById('scenarioRequest-' + id).value.trim();
        
        if (name && url) {
            scenarios.push({
                name: name,
                url: url,
                method: method,
                request: request || null
            });
        }
    });
    
    return scenarios;
}

// Get assertions from form
function getAssertions() {
    const assertions = [];
    const assertionItems = document.querySelectorAll('.assertion-item');
    
    assertionItems.forEach(item => {
        const checkboxes = item.querySelectorAll('input[type="checkbox"]:checked');
        const select = item.querySelector('select');
        const input = item.querySelector('input[type="text"]');
        
        // Handle default checkboxes (Status Code = 200, Response Time < 5000ms)
        checkboxes.forEach(checkbox => {
            const label = checkbox.closest('label').textContent.trim();
            if (label.includes('Status Code = 200')) {
                assertions.push({
                    type: 'status',
                    expected: '200',
                    description: 'Status Code should be 200'
                });
            } else if (label.includes('Response Time < 5000ms')) {
                assertions.push({
                    type: 'responseTime',
                    expected: '5000',
                    description: 'Response time should be less than 5000ms'
                });
            }
        });
        
        // Handle custom assertions
        if (select && input && input.value.trim()) {
            assertions.push({
                type: select.value,
                expected: input.value.trim(),
                description: `${select.options[select.selectedIndex].text}: ${input.value.trim()}`
            });
        }
    });
    
    return assertions;
}

// Update Available Variables Display
function updateAvailableVariables() {
    const availableVariablesContainer = document.getElementById('availableVariables');
    const dbVariablesList = document.getElementById('dbVariablesList');
    const generatedVariablesList = document.getElementById('generatedVariablesList');
    
    // Clear previous content
    dbVariablesList.innerHTML = '';
    generatedVariablesList.innerHTML = '';
    
    let hasVariables = false;
    
    // Get database query variables
    const queries = getQueries();
    if (queries.length > 0) {
        queries.forEach(query => {
            // Extract variable name from query (assuming it follows KEY-VALUE pattern)
            const keyMatch = query.query.match(/'([^']+)'\s+AS\s+KEY/i);
            if (keyMatch) {
                const variableName = keyMatch[1];
                const variableItem = createVariableItem(variableName, 'database');
                dbVariablesList.appendChild(variableItem);
                hasVariables = true;
            }
        });
    }
    
    // Get variable generators
    const generators = getVariableGenerators();
    if (generators.length > 0) {
        generators.forEach(generator => {
            if (generator.name) {
                const variableItem = createVariableItem(generator.name, 'generated');
                generatedVariablesList.appendChild(variableItem);
                hasVariables = true;
            }
        });
    }
    
    // Show/hide the container based on whether we have variables
    if (hasVariables) {
        availableVariablesContainer.style.display = 'block';
    } else {
        availableVariablesContainer.style.display = 'none';
    }
}

// Create a clickable variable item
function createVariableItem(variableName, type) {
    const item = document.createElement('span');
    item.className = 'variable-item';
    item.textContent = `{{${variableName}}}`;
    item.title = `Click to copy {{${variableName}}} to clipboard`;
    
    item.addEventListener('click', function() {
        copyToClipboard(`{{${variableName}}}`);
        
        // Visual feedback
        item.classList.add('copied');
        const originalText = item.textContent;
        item.textContent = '✓ Copied!';
        
        setTimeout(() => {
            item.classList.remove('copied');
            item.textContent = originalText;
        }, 1000);
    });
    
    return item;
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard:', text);
        }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback clipboard copy for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('Copied to clipboard (fallback):', text);
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert(`Please copy this manually: ${text}`);
    }
    
    document.body.removeChild(textArea);
}

// Config Preview
function showConfigPreview() {
    const config = buildConfig();
    const preview = document.getElementById('configPreview');
    preview.textContent = JSON.stringify(config, null, 2);
}

function buildConfig() {
    const authType = document.getElementById('authType').value;
    const config = {
        collectionName: document.getElementById('collectionName').value.trim(),
        
        // Database Configuration
        dbConfig: {
            jdbcUrl: document.getElementById('jdbcUrl').value.trim(),
            username: document.getElementById('dbUsername').value.trim(),
            password: document.getElementById('dbPassword').value.trim()
        },
        
        // Variable Generators (Dates, IDs, etc.)
        variableGenerators: getVariableGenerators(),
        
        // Database Queries (Key-Value pairs)
        dataQueries: getQueries(),
        
        // Test Scenarios (Manual + CSV)
        scenarios: getScenarios(),
        
        // CSV Scenarios
        csvScenarios: csvScenarios || [],
        
        // Test Assertions
        assertions: getAssertions(),
        
        // Authentication
        authType: authType
    };
    
    // Add auth details
    if (authType === 'basic') {
        config.basicAuth = {
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value.trim()
        };
    } else if (authType === 'bearer') {
        config.bearerToken = document.getElementById('bearerToken').value.trim();
    }
    
    return config;
}

// Collection Generation
async function generateCollection() {
    const config = buildConfig();
    
    // Show loading
    document.getElementById('generationStatus').style.display = 'block';
    document.getElementById('generationResult').style.display = 'none';
    
    try {
        // Send to backend
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        
        if (!response.ok) {
            throw new Error('Generation failed: ' + response.statusText);
        }
        
        const result = await response.json();
        
        // Store collection ID for downloads
        generatedFiles = {
            collectionId: result.collectionId,
            collectionName: result.collectionName,
            expiresIn: result.expiresIn
        };
        
        // Show success with collection info
        document.getElementById('generationStatus').style.display = 'none';
        document.getElementById('generationResult').style.display = 'block';
        
        // Update the success message
        const successMsg = document.querySelector('.success-message h3');
        successMsg.textContent = `✅ Collection "${result.collectionName}" Generated Successfully!`;
        
        const successInfo = document.querySelector('.success-message p');
        successInfo.textContent = `Your collection is stored in memory and will expire in ${result.expiresIn}`;
        
    } catch (error) {
        document.getElementById('generationStatus').style.display = 'none';
        alert('Error generating collection: ' + error.message + '\n\nPlease make sure the backend server is running.');
    }
}

// File Download (fetch from server's in-memory storage)
async function downloadFile(type) {
    if (type === 'all') {
        downloadAllFiles();
        return;
    }
    
    try {
        console.log(`🔄 Starting download for type: ${type}`);
        const collectionId = generatedFiles.collectionId;
        const url = `/api/download/${collectionId}/${type}`;
        
        console.log(`📡 Fetching from: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Download failed: ' + response.statusText);
        }
        
        // Get the content type from response header
        const contentType = response.headers.get('Content-Type') || 'text/plain';
        
        // Get the text content (since we're dealing with text files)
        const content = await response.text();
        
        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = type + '_file';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }

        // Ensure proper file extensions
        if (!filename.includes('.')) {
            switch(type) {
                case 'collection':
                    filename += '.bru';
                    break;
                case 'app':
                    filename += '.js';
                    break;
                case 'package':
                    filename += '.json';
                    break;
                case 'instructions':
                    filename += '.md';
                    break;
                default:
                    filename += '.txt';
            }
        }
        
        // Create blob with proper content type for text files
        const blob = new Blob([content], { 
            type: contentType.includes('charset') ? contentType : contentType + '; charset=utf-8' 
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Try different download methods based on browser capabilities
        let downloadSuccess = false;

        // Method 1: IE/Edge support
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            try {
                window.navigator.msSaveOrOpenBlob(blob, filename);
                console.log(`✅ Downloaded: ${filename}`);
                downloadSuccess = true;
            } catch (e) {
                console.warn('IE/Edge download failed:', e);
            }
        }
        
        // Method 2: Modern browsers with download attribute
        if (!downloadSuccess) {
            try {
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                a.style.display = 'none';
                a.target = '_blank';
                
                // Add to DOM temporarily
                document.body.appendChild(a);
                
                // Trigger download
                a.click();
                
                // Clean up immediately
                setTimeout(() => {
                    if (document.body.contains(a)) {
                        document.body.removeChild(a);
                    }
                }, 100);
                
                console.log(`✅ Downloaded: ${filename}`);
                downloadSuccess = true;
            } catch (e) {
                console.warn('Modern browser download failed:', e);
            }
        }
        
        // Method 3: Fallback - open in new window
        if (!downloadSuccess) {
            try {
                const newWindow = window.open(downloadUrl, '_blank');
                if (newWindow) {
                    console.log(`✅ Opened in new window: ${filename}`);
                    // Add instructions for manual save
                    setTimeout(() => {
                        alert(`File opened in new window. To save:\n\n1. Right-click on the content\n2. Select "Save As..."\n3. Save as: ${filename}`);
                    }, 1000);
                } else {
                    throw new Error('Popup blocked');
                }
                downloadSuccess = true;
            } catch (e) {
                console.error('All download methods failed:', e);
            }
        }
        
        // Method 4: Last resort - show content in alert (for small files)
        if (!downloadSuccess && content.length < 5000) {
            const saveInstructions = `Download failed. Please copy the content below and save it as "${filename}":\n\n${content}`;
            alert(saveInstructions);
        } else if (!downloadSuccess) {
            alert(`Download failed for ${filename}. Please check your browser settings and allow downloads from this site.`);
        }
        
        // Cleanup after download with delay
        setTimeout(() => {
            try {
                window.URL.revokeObjectURL(downloadUrl);
                if (document.body.contains(a)) {
                    document.body.removeChild(a);
                }
            } catch (e) {
                console.warn('Cleanup error:', e);
            }
        }, 1000);
        
    } catch (error) {
        alert('Error downloading file: ' + error.message);
    }
}

async function downloadAllFiles() {
    try {
        // Download files sequentially with small delays
        await downloadFile('collection');
        await new Promise(resolve => setTimeout(resolve, 300));
        await downloadFile('app');
        await new Promise(resolve => setTimeout(resolve, 300));
        await downloadFile('package');
        await new Promise(resolve => setTimeout(resolve, 300));
        await downloadFile('instructions');
        
        // Ask if user wants to delete the collection from memory
        if (confirm('All files downloaded successfully!\n\nWould you like to delete this collection from server memory?')) {
            await deleteCollection();
        }
        
    } catch (error) {
        alert('Error downloading files: ' + error.message);
    }
}

// Delete collection from server memory
async function deleteCollection() {
    try {
        const collectionId = generatedFiles.collectionId;
        const response = await fetch(`/api/collection/${collectionId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('✅ Collection deleted from server memory');
            alert('Collection deleted from server memory successfully!');
        }
        
    } catch (error) {
        console.error('Error deleting collection:', error);
    }
}

// Troubleshooting functions
function showDownloadHelp() {
    const helpText = `
📋 DOWNLOAD TROUBLESHOOTING GUIDE

If you're having trouble opening downloaded files:

1. CHECK FILE LOCATION
   • Look in your Downloads folder
   • Files should have proper extensions (.bru, .js, .json, .md)

2. FILE ASSOCIATION ISSUES
   • Right-click file → "Open with" → Choose text editor
   • Recommended: VS Code, Notepad++, or regular Notepad

3. BROWSER SECURITY
   • Allow downloads in browser settings
   • Disable popup blocker temporarily
   • Try different browser (Chrome, Edge, Firefox)

4. MANUAL SAVE
   • Right-click download button → "Save As"
   • Ensure correct filename and extension

5. FILE CORRUPTION
   • Check file size (should not be 0 bytes)
   • Try downloading individual files instead of all at once

Need more help? Click "Run Diagnostics" button for detailed info.
    `;
    
    alert(helpText);
}

function runDiagnostics() {
    const diagnostics = diagnoseDownloadIssues();
    
    const report = `
🔍 DOWNLOAD DIAGNOSTICS REPORT

Browser: ${navigator.userAgent}
Download Folder: ${diagnostics.downloadFolder}

✅ FEATURE SUPPORT:
• HTML5 Download: ${diagnostics.canDownload ? '✅ Yes' : '❌ No'}
• Blob Support: ${typeof Blob !== 'undefined' ? '✅ Yes' : '❌ No'}
• URL Object: ${typeof URL !== 'undefined' ? '✅ Yes' : '❌ No'}
• IE/Edge Support: ${typeof navigator.msSaveOrOpenBlob === 'function' ? '✅ Yes' : '❌ No'}

📁 DOWNLOAD TIPS:
1. Check your Downloads folder (usually C:\\Users\\YourName\\Downloads)
2. Files should have extensions: .bru, .js, .json, .md
3. If missing extensions, rename files manually
4. Open .bru and .js files with text editor (VS Code, Notepad++)

💡 STILL HAVING ISSUES?
• Try different browser
• Check antivirus software
• Verify browser allows downloads from localhost
• Contact support with this diagnostic info
    `;
    
    alert(report);
    console.log('Full diagnostics:', diagnostics);
}

// Reset Form
function resetForm() {
    currentStep = 1;
    queryCount = 0;
    scenarioCount = 0;
    generatedFiles = {};
    
    // Reset all form fields
    document.getElementById('collectionName').value = '';
    
    // Database fields
    document.getElementById('jdbcUrl').value = '';
    document.getElementById('dbUsername').value = '';
    document.getElementById('dbPassword').value = '';
    
    // Authentication fields
    document.getElementById('authType').value = 'basic';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('bearerToken').value = '';
    
    // Clear queries and scenarios
    document.getElementById('queriesContainer').innerHTML = '';
    document.getElementById('scenariosContainer').innerHTML = '';
    
    // Add default items
    addQuery();
    addScenario();
    
    // Reset display
    updateStepDisplay();
    
    // Hide result and connection status
    document.getElementById('generationResult').style.display = 'none';
    const connectionStatus = document.getElementById('dbConnectionStatus');
    if (connectionStatus) {
        connectionStatus.style.display = 'none';
    }
}

// CSV Template download function
function downloadCSVTemplate() {
    const csvContent = "scenario_name,scenario_type,request_body\n" +
                      "Login User,POST,\"{\\\"username\\\": \\\"{{testUser}}\\\", \\\"password\\\": \\\"{{testPassword}}\\\"}\"\n" +
                      "Get User Profile,GET,\"\"\n" +
                      "Update Profile,PUT,\"{\\\"name\\\": \\\"{{userName}}\\\", \\\"email\\\": \\\"{{userEmail}}\\\"}\"\n";
    
    downloadTextAsFile(csvContent, 'scenario_template.csv', 'text/csv');
}

// Handle CSV file upload
function handleCSVUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    const statusDiv = document.getElementById('csvUploadStatus');
    statusDiv.innerHTML = '<div style="color: #0066cc;">📤 Processing CSV file...</div>';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const parsedData = parseCSV(csv);
            
            if (parsedData.length === 0) {
                statusDiv.innerHTML = '<div style="color: #cc0000;">❌ No valid data found in CSV file.</div>';
                return;
            }
            
            csvScenarios = parsedData;
            console.log('✅ CSV scenarios updated:', csvScenarios);
            displayCSVPreview(parsedData);
            statusDiv.innerHTML = `<div style="color: #009900;">✅ Successfully loaded ${parsedData.length} scenarios from CSV</div>`;
            
        } catch (error) {
            console.error('CSV parsing error:', error);
            statusDiv.innerHTML = '<div style="color: #cc0000;">❌ Error parsing CSV file. Please check the format.</div>';
        }
    };
    
    reader.readAsText(file);
}

// Simple CSV parser
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const scenarios = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 3) {
            scenarios.push({
                name: values[0]?.trim() || `Scenario ${i}`,
                type: values[1]?.trim() || 'GET',
                requestBody: values[2]?.trim() || ''
            });
        }
    }
    
    return scenarios;
}

// Parse CSV line handling quoted values
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Display CSV preview
function displayCSVPreview(scenarios) {
    const previewDiv = document.getElementById('csvScenariosPreview');
    const tableDiv = document.getElementById('csvScenariosTable');
    
    let tableHTML = '<table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">';
    tableHTML += '<thead><tr style="background-color: #f5f5f5;">';
    tableHTML += '<th style="border: 1px solid #ddd; padding: 8px;">Scenario Name</th>';
    tableHTML += '<th style="border: 1px solid #ddd; padding: 8px;">Type</th>';
    tableHTML += '<th style="border: 1px solid #ddd; padding: 8px;">Request Body</th>';
    tableHTML += '</tr></thead><tbody>';
    
    scenarios.forEach((scenario, index) => {
        tableHTML += '<tr>';
        tableHTML += `<td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(scenario.name)}</td>`;
        tableHTML += `<td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(scenario.type)}</td>`;
        tableHTML += `<td style="border: 1px solid #ddd; padding: 8px; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                        ${escapeHtml(scenario.requestBody.substring(0, 100))}${scenario.requestBody.length > 100 ? '...' : ''}
                      </td>`;
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    tableDiv.innerHTML = tableHTML;
    previewDiv.style.display = 'block';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add assertion function
function addAssertion() {
    const container = document.getElementById('assertionsContainer');
    const assertionDiv = document.createElement('div');
    assertionDiv.className = 'assertion-item';
    assertionDiv.innerHTML = `
        <h4>Custom Assertion</h4>
        <div class="form-row">
            <div class="form-group">
                <label>Assertion Type:</label>
                <select onchange="updateAssertionFields(this)">
                    <option value="status">Status Code</option>
                    <option value="responseTime">Response Time</option>
                    <option value="jsonPath">JSON Path</option>
                    <option value="header">Response Header</option>
                    <option value="body">Response Body Contains</option>
                </select>
            </div>
            <div class="form-group assertion-details">
                <label>Expected Value:</label>
                <input type="text" placeholder="e.g., 200" />
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-danger btn-small" onclick="this.closest('.assertion-item').remove()">Remove</button>
            </div>
        </div>
    `;
    container.appendChild(assertionDiv);
}

// Update assertion fields based on type
function updateAssertionFields(select) {
    const details = select.closest('.assertion-item').querySelector('.assertion-details');
    const input = details.querySelector('input');
    
    switch(select.value) {
        case 'status':
            input.placeholder = 'e.g., 200, 201, 404';
            details.querySelector('label').textContent = 'Expected Status Code:';
            break;
        case 'responseTime':
            input.placeholder = 'e.g., 5000 (milliseconds)';
            details.querySelector('label').textContent = 'Max Response Time (ms):';
            break;
        case 'jsonPath':
            input.placeholder = 'e.g., $.data.id should exist';
            details.querySelector('label').textContent = 'JSON Path Expression:';
            break;
        case 'header':
            input.placeholder = 'e.g., Content-Type: application/json';
            details.querySelector('label').textContent = 'Header Name: Expected Value:';
            break;
        case 'body':
            input.placeholder = 'e.g., "success": true';
            details.querySelector('label').textContent = 'Expected Text in Body:';
            break;
    }
}
