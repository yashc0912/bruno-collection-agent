const { test, expect } = require('@playwright/test');

test.describe('PlaywrightMCP - Restructured Web UI Complete Sanity Check', () => {
    const BASE_URL = 'http://localhost:3001/index.html';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
    });

    test('🏠 Homepage loads correctly', async ({ page }) => {
        // Verify page title and main elements
        expect(await page.title()).toBe('Bruno Collection Generator - Web UI');
        await expect(page.locator('h1')).toContainText('Bruno Collection Generator');
        await expect(page.locator('.subtitle')).toContainText('Generate complete API test collections');
    });

    test('📋 New step structure is correct', async ({ page }) => {
        // Verify the NEW step structure
        const expectedSteps = [
            { number: '1', label: 'Collection Info' },
            { number: '2', label: 'Database & Queries' },
            { number: '3', label: 'Test Scenarios' },
            { number: '4', label: 'Authentication' },
            { number: '5', label: 'Generate' }
        ];

        for (const step of expectedSteps) {
            await expect(page.locator(`[data-step="${step.number}"] .step-number`)).toContainText(step.number);
            await expect(page.locator(`[data-step="${step.number}"] .step-label`)).toContainText(step.label);
        }

        // Step 1 should be active initially
        await expect(page.locator('.step.active .step-number')).toContainText('1');
    });

    test('📝 Step 1: Collection Info validation', async ({ page }) => {
        // Test empty validation
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('collection name');
            await dialog.accept();
        });
        
        await page.click('#step1 .btn-primary');
        await expect(page.locator('#step1')).toHaveClass(/active/);

        // Test successful navigation
        await page.fill('#collectionName', 'Sanity Test Collection');
        await page.click('#step1 .btn-primary');
        await expect(page.locator('#step2')).toHaveClass(/active/);
    });

    test('🗄️ Step 2: Database & Queries functionality', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Verify Step 2 is Database & Queries
        await expect(page.locator('#step2 h2')).toContainText('Database & Queries');
        
        // Check all database form fields
        await expect(page.locator('#jdbcUrl')).toBeVisible();
        await expect(page.locator('#dbUsername')).toBeVisible();
        await expect(page.locator('#dbPassword')).toBeVisible();
        
        // Check database connection test button
        await expect(page.locator('button:has-text("Test Database Connection")')).toBeVisible();
        
        // Verify default query is added
        await expect(page.locator('.query-item')).toBeVisible();
        await expect(page.locator('#queriesContainer .query-item')).toHaveCount(1);
        
        // Test adding queries
        await page.click('button:has-text("Add Query")');
        await expect(page.locator('#queriesContainer .query-item')).toHaveCount(2);
        
        // Test removing queries
        await page.click('.query-item .remove-query');
        await expect(page.locator('#queriesContainer .query-item')).toHaveCount(1);
    });

    test('🔍 Database connection test functionality', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Fill database details
        await page.fill('#jdbcUrl', 'jdbc:sqlserver://test:1433;databaseName=TestDB');
        await page.fill('#dbUsername', 'testuser');
        await page.fill('#dbPassword', 'testpass');
        
        // Test connection
        await page.click('button:has-text("Test Database Connection")');
        
        // Verify connection status appears
        await expect(page.locator('#dbConnectionStatus')).toBeVisible();
        await page.waitForSelector('#dbConnectionStatus.connection-status', { timeout: 10000 });
        
        // Should show success or error message
        const statusElement = page.locator('#dbConnectionStatus');
        await expect(statusElement).toHaveClass(/connection-status/);
    });

    test('📊 Query format validation and examples', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Check query format examples are displayed
        await expect(page.locator('.query-example')).toBeVisible();
        await expect(page.locator('.query-example h4')).toContainText('Query Format Example');
        
        // Fill query with correct format
        await page.fill('[id^="queryName-"]', 'Get Contract ID');
        await page.fill('[id^="querySQL-"]', `SELECT MAX(PC_CONT) AS VALUE, 'Contract_DA' AS KEY FROM T_LIPC_POLICY_COMMON`);
        
        // Verify fields are filled
        await expect(page.locator('[id^="queryName-"]')).toHaveValue('Get Contract ID');
    });

    test('🧪 Step 3: Test Scenarios functionality', async ({ page }) => {
        // Navigate to Step 3
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Fill minimal database info to proceed
        await page.fill('#jdbcUrl', 'jdbc:sqlserver://test:1433;databaseName=TestDB');
        await page.fill('#dbUsername', 'testuser');
        await page.fill('#dbPassword', 'testpass');
        await page.fill('[id^="queryName-"]', 'Test Query');
        await page.fill('[id^="querySQL-"]', `SELECT 'test' AS VALUE, 'TestKey' AS KEY`);
        
        await page.click('#step2 .btn-primary');
        
        // Verify Step 3 is Test Scenarios
        await expect(page.locator('#step3 h2')).toContainText('Test Scenarios');
        
        // Check default scenario is added
        await expect(page.locator('.scenario-item')).toBeVisible();
        await expect(page.locator('#scenariosContainer .scenario-item')).toHaveCount(1);
        
        // Test scenario form fields
        await expect(page.locator('[id^="scenarioName-"]')).toBeVisible();
        await expect(page.locator('[id^="scenarioUrl-"]')).toBeVisible();
        await expect(page.locator('[id^="scenarioMethod-"]')).toBeVisible();
        await expect(page.locator('[id^="scenarioRequest-"]')).toBeVisible();
        
        // Test adding scenarios
        await page.click('button:has-text("Add Scenario")');
        await expect(page.locator('#scenariosContainer .scenario-item')).toHaveCount(2);
        
        // Test removing scenarios
        await page.click('.scenario-item .remove-scenario');
        await expect(page.locator('#scenariosContainer .scenario-item')).toHaveCount(1);
    });

    test('🔗 Variable substitution in scenarios', async ({ page }) => {
        // Navigate to Step 3
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Fill database info
        await page.fill('#jdbcUrl', 'jdbc:sqlserver://test:1433;databaseName=TestDB');
        await page.fill('#dbUsername', 'testuser');
        await page.fill('#dbPassword', 'testpass');
        await page.fill('[id^="queryName-"]', 'Contract Query');
        await page.fill('[id^="querySQL-"]', `SELECT '12345' AS VALUE, 'Contract_DA' AS KEY`);
        
        await page.click('#step2 .btn-primary');
        
        // Fill scenario with variable substitution
        await page.fill('[id^="scenarioName-"]', 'Get Contract Details');
        await page.fill('[id^="scenarioUrl-"]', 'https://api.example.com/contract/{{Contract_DA}}');
        await page.fill('[id^="scenarioRequest-"]', '{"contractId": "{{Contract_DA}}", "type": "summary"}');
        
        // Verify values are set
        await expect(page.locator('[id^="scenarioUrl-"]')).toHaveValue('https://api.example.com/contract/{{Contract_DA}}');
        await expect(page.locator('[id^="scenarioRequest-"]')).toHaveValue('{"contractId": "{{Contract_DA}}", "type": "summary"}');
    });

    test('🔐 Step 4: Authentication functionality', async ({ page }) => {
        // Navigate through all steps to Step 4
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Step 2: Database
        await page.fill('#jdbcUrl', 'jdbc:sqlserver://test:1433;databaseName=TestDB');
        await page.fill('#dbUsername', 'testuser');
        await page.fill('#dbPassword', 'testpass');
        await page.fill('[id^="queryName-"]', 'Test Query');
        await page.fill('[id^="querySQL-"]', `SELECT 'test' AS VALUE, 'TestKey' AS KEY`);
        await page.click('#step2 .btn-primary');
        
        // Step 3: Scenarios
        await page.fill('[id^="scenarioName-"]', 'Test Scenario');
        await page.fill('[id^="scenarioUrl-"]', 'https://api.example.com/test');
        await page.click('#step3 .btn-primary');
        
        // Verify Step 4 is Authentication
        await expect(page.locator('#step4 h2')).toContainText('Authentication');
        
        // Test authentication options
        await expect(page.locator('#authType')).toBeVisible();
        await expect(page.locator('#basicAuthFields')).toBeVisible();
        
        // Test Basic Auth
        await page.fill('#username', 'apiuser');
        await page.fill('#password', 'apipass');
        
        // Test Bearer Token option
        await page.selectOption('#authType', 'bearer');
        await expect(page.locator('#bearerTokenFields')).toBeVisible();
        await page.fill('#bearerToken', 'test-token-123');
        
        // Switch back to Basic Auth
        await page.selectOption('#authType', 'basic');
        await expect(page.locator('#basicAuthFields')).toBeVisible();
    });

    test('📥 Complete workflow to Step 5 (Generate)', async ({ page }) => {
        // Complete workflow test
        
        // Step 1: Collection Info
        await page.fill('#collectionName', 'Complete Sanity Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Step 2: Database & Queries
        await page.fill('#jdbcUrl', 'jdbc:sqlserver://testserver:1433;databaseName=TestDB');
        await page.fill('#dbUsername', 'testuser');
        await page.fill('#dbPassword', 'testpass');
        await page.fill('[id^="queryName-"]', 'Get Contract ID');
        await page.fill('[id^="querySQL-"]', `SELECT MAX(PC_CONT) AS VALUE, 'Contract_DA' AS KEY FROM T_LIPC_POLICY_COMMON WHERE PC_PLN_CODE='864'`);
        await page.click('#step2 .btn-primary');
        
        // Step 3: Test Scenarios
        await page.fill('[id^="scenarioName-"]', 'Get Contract Summary');
        await page.fill('[id^="scenarioUrl-"]', 'https://api.example.com/contract/{{Contract_DA}}/summary');
        await page.selectOption('[id^="scenarioMethod-"]', 'POST');
        await page.fill('[id^="scenarioRequest-"]', '{"contractId": "{{Contract_DA}}", "includeDetails": true}');
        await page.click('#step3 .btn-primary');
        
        // Step 4: Authentication
        await page.selectOption('#authType', 'basic');
        await page.fill('#username', 'testapi');
        await page.fill('#password', 'testpass123');
        await page.click('#step4 .btn-primary');
        
        // Step 5: Generate & Download
        await expect(page.locator('#step5')).toHaveClass(/active/);
        await expect(page.locator('#step5 h2')).toContainText('Generate Your Collection');
        
        // Should show configuration preview
        await expect(page.locator('#configPreview')).toBeVisible();
        
        // Should show generate button
        await expect(page.locator('button:has-text("Generate Collection")')).toBeVisible();
    });

    test('🔧 Troubleshooting features work', async ({ page }) => {
        // Navigate to Step 5 (complete workflow)
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        await page.fill('#jdbcUrl', 'jdbc:sqlserver://test:1433;databaseName=TestDB');
        await page.fill('#dbUsername', 'testuser');
        await page.fill('#dbPassword', 'testpass');
        await page.fill('[id^="queryName-"]', 'Test');
        await page.fill('[id^="querySQL-"]', `SELECT 'test' AS VALUE, 'Key' AS KEY`);
        await page.click('#step2 .btn-primary');
        
        await page.fill('[id^="scenarioName-"]', 'Test Scenario');
        await page.fill('[id^="scenarioUrl-"]', 'https://api.example.com/test');
        await page.click('#step3 .btn-primary');
        
        await page.click('#step4 .btn-primary');
        
        // Generate collection to get to download section
        await page.click('button:has-text("Generate Collection")');
        
        // Wait for generation to complete (may take a moment)
        await page.waitForSelector('#generationResult', { timeout: 10000 });
        
        // Check if troubleshooting buttons exist
        if (await page.locator('button:has-text("Download Troubleshooting")').isVisible()) {
            await page.click('button:has-text("Download Troubleshooting")');
            
            // Should show troubleshooting dialog
            page.on('dialog', async dialog => {
                expect(dialog.message()).toContain('TROUBLESHOOTING GUIDE');
                await dialog.accept();
            });
        }
        
        // Test diagnostics if available
        if (await page.locator('button:has-text("Run Diagnostics")').isVisible()) {
            await page.click('button:has-text("Run Diagnostics")');
        }
    });

    test('↩️ Navigation and form persistence', async ({ page }) => {
        // Test that form data persists when navigating back and forth
        
        // Fill Step 1
        await page.fill('#collectionName', 'Persistence Test');
        await page.click('#step1 .btn-primary');
        
        // Fill Step 2
        await page.fill('#jdbcUrl', 'jdbc:sqlserver://persist:1433;databaseName=TestDB');
        await page.fill('#dbUsername', 'persistuser');
        
        // Go back to Step 1
        await page.click('#step2 .btn-secondary');
        await expect(page.locator('#step1')).toHaveClass(/active/);
        
        // Verify Step 1 data is preserved
        await expect(page.locator('#collectionName')).toHaveValue('Persistence Test');
        
        // Go forward to Step 2
        await page.click('#step1 .btn-primary');
        await expect(page.locator('#step2')).toHaveClass(/active/);
        
        // Verify Step 2 data is preserved
        await expect(page.locator('#jdbcUrl')).toHaveValue('jdbc:sqlserver://persist:1433;databaseName=TestDB');
        await expect(page.locator('#dbUsername')).toHaveValue('persistuser');
    });

    test('✅ Validation works for all steps', async ({ page }) => {
        // Test validation for each step
        
        // Step 1 validation (empty collection name)
        page.on('dialog', dialog => dialog.accept());
        await page.click('#step1 .btn-primary');
        await expect(page.locator('#step1')).toHaveClass(/active/);
        
        // Step 2 validation (empty database fields)
        await page.fill('#collectionName', 'Validation Test');
        await page.click('#step1 .btn-primary');
        await page.click('#step2 .btn-primary');
        await expect(page.locator('#step2')).toHaveClass(/active/);
        
        // Step 3 validation (empty scenarios)
        await page.fill('#jdbcUrl', 'jdbc:sqlserver://test:1433;databaseName=TestDB');
        await page.fill('#dbUsername', 'test');
        await page.fill('#dbPassword', 'test');
        await page.fill('[id^="queryName-"]', 'Test');
        await page.fill('[id^="querySQL-"]', `SELECT 'test' AS VALUE, 'Key' AS KEY`);
        await page.click('#step2 .btn-primary');
        
        // Clear default scenario and try to proceed
        await page.fill('[id^="scenarioName-"]', '');
        await page.click('#step3 .btn-primary');
        await expect(page.locator('#step3')).toHaveClass(/active/);
    });
});