const { test, expect } = require('@playwright/test');

test.describe('Bruno Collection Generator - End-to-End Test', () => {
  test('should create a collection via Web UI using Get Contract Summary configuration', async ({ page }) => {
    // Navigate to the Web UI
    await page.goto('http://localhost:3001/index.html');
    
    // Verify page loaded
    await expect(page).toHaveTitle('Bruno Collection Generator - Web UI');
    await expect(page.locator('h1')).toContainText('Bruno Collection Generator');

    // ========================================
    // STEP 1: Collection Information
    // ========================================
    await expect(page.locator('h2')).toContainText('Collection Information');
    
    // Fill in collection name
    await page.getByRole('textbox', { name: 'Collection Name *' }).fill('Get Contract Summary');
    
    // Click Next
    await page.getByRole('button', { name: 'Next Step →' }).click();

    // ========================================
    // STEP 2: API Details
    // ========================================
    await expect(page.locator('h2')).toContainText('API Details');
    
    // Fill in API URL
    await page.getByRole('textbox', { name: 'API URL *' })
      .fill('http://ix-aks.alipacn.com/ixat1/wsgateway/contracts/{contractId}/summary');
    
    // Select HTTP Method
    await page.getByLabel('HTTP Method *').selectOption('GET');
    
    // Click Next
    await page.getByRole('button', { name: 'Next Step →' }).click();

    // ========================================
    // STEP 3: Authentication
    // ========================================
    await expect(page.locator('h2')).toContainText('Authentication');
    
    // Verify Basic Auth is selected (default)
    await expect(page.getByLabel('Authentication Type *')).toHaveValue('basic');
    
    // Fill in credentials
    await page.getByRole('textbox', { name: 'Username *' }).fill('CLIENTUSER');
    await page.getByRole('textbox', { name: 'Password *' }).fill('k$@#0n!51P');
    
    // Click Next
    await page.getByRole('button', { name: 'Next Step →' }).click();

    // ========================================
    // STEP 4: Database Configuration
    // ========================================
    await expect(page.locator('h2')).toContainText('Database Configuration');
    
    // Verify MSSQL is selected
    await expect(page.getByLabel('Database Type *')).toHaveValue('mssql');
    
    // Fill in database details
    await page.getByRole('textbox', { name: 'Database Username *' }).fill('alipuser');
    await page.getByRole('textbox', { name: 'Database Password *' }).fill('Alip!2023');
    await page.getByRole('textbox', { name: 'Database Server *' })
      .fill('ix-sqlmi1.9e004d9e1a61.database.windows.net');
    await page.getByRole('textbox', { name: 'Database Name *' }).fill('IXAT1');

    // ========================================
    // Query #1: Valid Contract ID
    // ========================================
    await expect(page.locator('h4')).toContainText('Query #1');
    
    // Fill in first query
    await page.locator('#queryName-1').fill('Valid Contract ID');
    await page.locator('#queryEndpoint-1').fill('/contract-id');
    await page.locator('#querySQL-1')
      .fill("SELECT TOP 1 POL_POLICY_NUM AS VALUE, 'ValidContract' AS [KEY] FROM POLICY.T_POPM_POLICY_MASTER WHERE POL_STATUS_CODE = 'ACTIVE' ORDER BY POL_POLICY_NUM DESC");
    await page.locator('#queryDescription-1').fill('Fetch valid active contract ID for positive testing');

    // Add second query
    await page.getByRole('button', { name: '+ Add Query' }).click();

    // ========================================
    // Query #2: Term Life Contract
    // ========================================
    await expect(page.locator('h4').nth(1)).toContainText('Query #2');
    
    // Fill in second query
    await page.locator('#queryName-2').fill('Term Life Contract');
    await page.locator('#queryEndpoint-2').fill('/term-life-contract');
    await page.locator('#querySQL-2')
      .fill("SELECT TOP 1 POL_POLICY_NUM AS VALUE, 'TermLifeContract' AS [KEY] FROM POLICY.T_POPM_POLICY_MASTER WHERE POL_PRODUCT_TYPE = 'TERM_LIFE' AND POL_STATUS_CODE = 'ACTIVE' ORDER BY POL_POLICY_NUM DESC");
    await page.locator('#queryDescription-2').fill('Fetch term life contract for specific testing');

    // Click Generate Collection
    await page.getByRole('button', { name: 'Generate Collection →' }).click();

    // ========================================
    // STEP 5: Preview & Generate
    // ========================================
    await expect(page.locator('h2')).toContainText('Generate Your Collection');
    
    // Verify configuration preview contains key data
    const configPreview = await page.locator('.config-preview').textContent();
    expect(configPreview).toContain('Get Contract Summary');
    expect(configPreview).toContain('http://ix-aks.alipacn.com/ixat1/wsgateway/contracts');
    expect(configPreview).toContain('alipuser');
    expect(configPreview).toContain('Valid Contract ID');
    expect(configPreview).toContain('Term Life Contract');

    // Click final Generate button
    await page.getByRole('button', { name: '🚀 Generate Collection' }).click();

    // ========================================
    // Verify Success
    // ========================================
    // Wait for success message
    await expect(page.locator('h3')).toContainText('Collection "Get Contract Summary" Generated Successfully!', { timeout: 30000 });
    
    // Verify success message elements
    await expect(page.locator('text=Your collection is stored in memory')).toBeVisible();
    await expect(page.locator('text=will expire in 1 hour')).toBeVisible();

    // Verify download buttons are present
    await expect(page.getByRole('button', { name: '📥 Download Collection JSON' })).toBeVisible();
    await expect(page.getByRole('button', { name: '📥 Download app.js' })).toBeVisible();
    await expect(page.getByRole('button', { name: '📥 Download package.json' })).toBeVisible();
    await expect(page.getByRole('button', { name: '📦 Download All Files (ZIP)' })).toBeVisible();

    // Verify next steps section
    await expect(page.locator('h4')).toContainText('Next Steps:');
    await expect(page.locator('text=Download all files')).toBeVisible();
    await expect(page.locator('text=npm install')).toBeVisible();
    await expect(page.locator('text=node app.js')).toBeVisible();

    // Test download functionality
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '📥 Download Collection JSON' }).click();
    const download = await downloadPromise;
    
    // Verify download filename
    expect(download.suggestedFilename()).toContain('Get-Contract-Summary');
    
    console.log('✅ Collection generated and downloaded successfully!');
  });

  test('should verify server health endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.ok()).toBeTruthy();
    
    const health = await response.json();
    expect(health.status).toBe('ok');
    expect(health.timestamp).toBeDefined();
    expect(health.memory).toBeDefined();
    expect(health.memory.totalCollections).toBeGreaterThanOrEqual(0);
    
    console.log('✅ Server health check passed:', health);
  });
});
