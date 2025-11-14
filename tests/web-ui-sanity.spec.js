const { test, expect } = require('@playwright/test');

test.describe('Bruno Collection Generator - Restructured Web UI Sanity Tests', () => {
    const BASE_URL = 'http://localhost:3001/index.html';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
    });

    test('should load the home page successfully', async ({ page }) => {
        // Check if main heading is visible
        await expect(page.locator('h1')).toContainText('Bruno Collection Generator');
        
        // Check subtitle
        await expect(page.locator('.subtitle')).toContainText('Generate complete API test collections');
        
        // Verify page title
        expect(await page.title()).toBe('Bruno Collection Generator - Web UI');
    });

    test('should display all 5 progress steps with NEW structure', async ({ page }) => {
        // Check NEW step labels in correct order
        const newSteps = ['Collection Info', 'Database & Queries', 'Test Scenarios', 'Authentication', 'Generate'];
        
        for (let i = 0; i < newSteps.length; i++) {
            const stepNumber = i + 1;
            const stepLabel = newSteps[i];
            
            // Verify step exists with correct number and label
            await expect(page.locator(`[data-step="${stepNumber}"] .step-number`)).toContainText(stepNumber.toString());
            await expect(page.locator(`[data-step="${stepNumber}"] .step-label`)).toContainText(stepLabel);
        }
        
        // Verify step 1 is active
        await expect(page.locator('.step.active .step-number')).toContainText('1');
    });

    test('should show Step 1 (Collection Info) form fields', async ({ page }) => {
        // Verify Step 1 is active
        await expect(page.locator('#step1')).toHaveClass(/active/);
        
        // Check collection name field exists
        await expect(page.locator('#collectionName')).toBeVisible();
        await expect(page.locator('label[for="collectionName"]')).toContainText('Collection Name');
        
        // Check next button is visible
        await expect(page.locator('#step1 .btn-primary')).toBeVisible();
        await expect(page.locator('#step1 .btn-primary')).toContainText('Next');
    });

    test('should navigate from Step 1 to Step 2 (Database & Queries)', async ({ page }) => {
        // Fill collection name
        await page.fill('#collectionName', 'Sanity Test Collection');
        
        // Click Next Step
        await page.click('#step1 .btn-primary');
        
        // Wait for Step 2 to be active
        await expect(page.locator('#step2')).toHaveClass(/active/);
        await expect(page.locator('.step.active .step-number')).toContainText('2');
        
        // Verify it's the Database & Queries step
        await expect(page.locator('#step2 h2')).toContainText('Database & Queries');
    });

    test('should validate empty collection name', async ({ page }) => {
        // Try to go to next step without filling collection name
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('collection name');
            await dialog.accept();
        });
        
        await page.click('#step1 .btn-primary');
        
        // Should still be on step 1
        await expect(page.locator('#step1')).toHaveClass(/active/);
    });

    test('should display Step 2 Database & Queries form fields', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Wait for Step 2
        await expect(page.locator('#step2')).toHaveClass(/active/);
        
        // Verify NEW database form fields
        await expect(page.locator('#jdbcUrl')).toBeVisible();
        await expect(page.locator('#dbUsername')).toBeVisible();
        await expect(page.locator('#dbPassword')).toBeVisible();
        
        // Check database connection test button
        await expect(page.locator('button:has-text("Test Database Connection")')).toBeVisible();
        
        // Check queries container
        await expect(page.locator('#queriesContainer')).toBeVisible();
        
        // Verify at least one query is added by default
        await expect(page.locator('.query-item')).toBeVisible();
        
        // Check Previous and Next buttons
        await expect(page.locator('#step2 .btn-secondary')).toContainText('Previous');
        await expect(page.locator('#step2 .btn-primary')).toContainText('Next Step');
    });

    test('should test database connection functionality', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Fill database connection details
        await page.fill('#jdbcUrl', 'jdbc:sqlserver://test-server:1433;databaseName=TestDB');
        await page.fill('#dbUsername', 'testuser');
        await page.fill('#dbPassword', 'testpass');
        
        // Click test connection button
        await page.click('button:has-text("Test Database Connection")');
        
        // Wait for connection status to appear
        await expect(page.locator('#dbConnectionStatus')).toBeVisible();
        
        // Should show either success or error status
        await page.waitForSelector('#dbConnectionStatus.connection-status', { timeout: 5000 });
    });

    test('should allow adding and removing database queries', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Check initial query exists
        await expect(page.locator('.query-item')).toHaveCount(1);
        
        // Add another query
        await page.click('button:has-text("Add Query")');
        await expect(page.locator('.query-item')).toHaveCount(2);
        
        // Remove a query
        await page.click('.remove-query');
        await expect(page.locator('.query-item')).toHaveCount(1);
    });

    test('should navigate back from Step 2 to Step 1', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        await expect(page.locator('#step2')).toHaveClass(/active/);
        
        // Click Previous
        await page.click('#step2 .btn-secondary');
        
        // Should be back on Step 1
        await expect(page.locator('#step1')).toHaveClass(/active/);
        await expect(page.locator('.step.active .step-number')).toContainText('1');
        
        // Collection name should be preserved
        await expect(page.locator('#collectionName')).toHaveValue('Test Collection');
    });

    test('should validate API URL format', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Fill invalid URL
        await page.fill('#apiUrl', 'not-a-valid-url');
        
        // Try to go to next step
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('valid URL');
            await dialog.accept();
        });
        
        await page.click('#step2 .btn-primary');
        
        // Should still be on step 2
        await expect(page.locator('#step2')).toHaveClass(/active/);
    });

    test('should display Step 3 authentication form', async ({ page }) => {
        // Navigate to Step 3
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        await page.fill('#apiUrl', 'https://api.example.com/test');
        await page.click('#step2 .btn-primary');
        
        // Wait for Step 3
        await expect(page.locator('#step3')).toHaveClass(/active/);
        
        // Verify auth type dropdown
        await expect(page.locator('#authType')).toBeVisible();
        
        // Verify Basic Auth fields are visible by default
        await expect(page.locator('#basicAuthFields')).toBeVisible();
        await expect(page.locator('#username')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
    });

    test('should toggle authentication fields based on auth type', async ({ page }) => {
        // Navigate to Step 3
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        await page.fill('#apiUrl', 'https://api.example.com/test');
        await page.click('#step2 .btn-primary');
        
        // Basic Auth should be visible by default
        await expect(page.locator('#basicAuthFields')).toBeVisible();
        await expect(page.locator('#bearerTokenFields')).toBeHidden();
        
        // Switch to Bearer Token
        await page.selectOption('#authType', 'bearer');
        await expect(page.locator('#basicAuthFields')).toBeHidden();
        await expect(page.locator('#bearerTokenFields')).toBeVisible();
        
        // Switch to None
        await page.selectOption('#authType', 'none');
        await expect(page.locator('#basicAuthFields')).toBeHidden();
        await expect(page.locator('#bearerTokenFields')).toBeHidden();
    });

    test('should display Step 4 database configuration form', async ({ page }) => {
        // Navigate to Step 4
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        await page.fill('#apiUrl', 'https://api.example.com/test');
        await page.click('#step2 .btn-primary');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'testpass');
        await page.click('#step3 .btn-primary');
        
        // Wait for Step 4
        await expect(page.locator('#step4')).toHaveClass(/active/);
        
        // Verify database fields
        await expect(page.locator('#dbUser')).toBeVisible();
        await expect(page.locator('#dbPassword')).toBeVisible();
        await expect(page.locator('#dbServer')).toBeVisible();
        await expect(page.locator('#dbName')).toBeVisible();
        
        // Verify query container
        await expect(page.locator('#queriesContainer')).toBeVisible();
    });

    test('should add and remove database queries', async ({ page }) => {
        // Navigate to Step 4
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        await page.fill('#apiUrl', 'https://api.example.com/test');
        await page.click('#step2 .btn-primary');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'testpass');
        await page.click('#step3 .btn-primary');
        
        // Wait for initial query to be added
        await page.waitForSelector('.query-item', { timeout: 2000 });
        
        // Check initial query exists
        let queryItems = await page.locator('.query-item').count();
        expect(queryItems).toBeGreaterThan(0);
        const initialCount = queryItems;
        
        // Add another query
        await page.click('button:has-text("+ Add Query")');
        await page.waitForTimeout(500); // Wait for animation
        
        queryItems = await page.locator('.query-item').count();
        expect(queryItems).toBe(initialCount + 1);
        
        // Remove a query
        await page.click('.remove-query >> nth=0');
        await page.waitForTimeout(500);
        
        queryItems = await page.locator('.query-item').count();
        expect(queryItems).toBe(initialCount);
    });

    test('should format JSON payload', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Enter unformatted JSON
        const unformattedJson = '{"key":"value","nested":{"data":"test"}}';
        await page.fill('#requestPayload', unformattedJson);
        
        // Click Format JSON button
        await page.click('button:has-text("Format JSON")');
        
        // Check if JSON is formatted (should have newlines)
        const formattedValue = await page.locator('#requestPayload').inputValue();
        expect(formattedValue).toContain('\n');
        expect(formattedValue).toContain('  '); // Should have indentation
    });

    test('should complete full workflow to Step 5', async ({ page }) => {
        // Step 1: Collection Info
        await page.fill('#collectionName', 'Full Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Step 2: API Details
        await page.fill('#apiUrl', 'https://api.example.com/test');
        await page.selectOption('#httpMethod', 'POST');
        await page.fill('#requestPayload', '{"test": "data"}');
        await page.click('#step2 .btn-primary');
        
        // Step 3: Authentication
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'testpass');
        await page.click('#step3 .btn-primary');
        
        // Step 4: Database
        await page.fill('#dbUser', 'dbuser');
        await page.fill('#dbPassword', 'dbpass');
        await page.fill('#dbServer', 'server.example.com');
        await page.fill('#dbName', 'testdb');
        
        // Fill first query
        await page.fill('input[id^="queryName-"]', 'Test Query');
        await page.fill('input[id^="queryEndpoint-"]', '/test-endpoint');
        await page.fill('textarea[id^="querySQL-"]', 'SELECT * FROM TEST_TABLE');
        
        await page.click('#step4 .btn-primary');
        
        // Step 5: Generate
        await expect(page.locator('#step5')).toHaveClass(/active/);
        await expect(page.locator('.step.active .step-number')).toContainText('5');
        
        // Verify preview shows config
        await expect(page.locator('#configPreview')).toBeVisible();
        const previewText = await page.locator('#configPreview').textContent();
        expect(previewText).toContain('Full Test Collection');
        expect(previewText).toContain('api.example.com');
    });

    test('should show generation button on Step 5', async ({ page }) => {
        // Complete workflow to Step 5
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        await page.fill('#apiUrl', 'https://api.example.com/test');
        await page.click('#step2 .btn-primary');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'testpass');
        await page.click('#step3 .btn-primary');
        await page.fill('#dbUser', 'dbuser');
        await page.fill('#dbPassword', 'dbpass');
        await page.fill('#dbServer', 'server.example.com');
        await page.fill('#dbName', 'testdb');
        await page.fill('input[id^="queryName-"]', 'Test Query');
        await page.fill('input[id^="queryEndpoint-"]', '/test-endpoint');
        await page.fill('textarea[id^="querySQL-"]', 'SELECT * FROM TEST');
        await page.click('#step4 .btn-primary');
        
        // Check generate button
        await expect(page.locator('button:has-text("Generate Collection")')).toBeVisible();
    });

    test('should have responsive design elements', async ({ page }) => {
        // Check if container exists
        await expect(page.locator('.container')).toBeVisible();
        
        // Check if main content exists
        await expect(page.locator('.main-content')).toBeVisible();
        
        // Check if footer exists
        await expect(page.locator('footer')).toBeVisible();
    });

    test('should display HTTP method options', async ({ page }) => {
        // Navigate to Step 2
        await page.fill('#collectionName', 'Test Collection');
        await page.click('#step1 .btn-primary');
        
        // Check HTTP method dropdown has options
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        for (const method of methods) {
            await expect(page.locator(`#httpMethod option[value="${method}"]`)).toBeVisible();
        }
    });

    test('should persist form data when navigating back and forth', async ({ page }) => {
        const testData = {
            collectionName: 'Persistence Test',
            apiUrl: 'https://api.example.com/persist',
            username: 'persistuser',
            password: 'persistpass'
        };
        
        // Fill Step 1
        await page.fill('#collectionName', testData.collectionName);
        await page.click('#step1 .btn-primary');
        
        // Fill Step 2
        await page.fill('#apiUrl', testData.apiUrl);
        await page.click('#step2 .btn-primary');
        
        // Fill Step 3
        await page.fill('#username', testData.username);
        await page.fill('#password', testData.password);
        
        // Navigate back to Step 1
        await page.click('#step3 .btn-secondary'); // Back to Step 2
        await page.click('#step2 .btn-secondary'); // Back to Step 1
        
        // Verify data is still there
        await expect(page.locator('#collectionName')).toHaveValue(testData.collectionName);
        
        // Navigate forward to Step 2
        await page.click('#step1 .btn-primary');
        await expect(page.locator('#apiUrl')).toHaveValue(testData.apiUrl);
        
        // Navigate to Step 3
        await page.click('#step2 .btn-primary');
        await expect(page.locator('#username')).toHaveValue(testData.username);
        await expect(page.locator('#password')).toHaveValue(testData.password);
    });
});
