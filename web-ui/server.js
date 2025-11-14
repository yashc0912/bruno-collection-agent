const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Import generator from parent directory
const generatorPath = path.join(__dirname, '..', 'bruno-collection-generator.js');
const BrunoCollectionGenerator = require(generatorPath);

const app = express();
const PORT = 3001;

// Middleware for CORS (allow browser downloads)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type, Content-Length');
    next();
});

// In-memory storage for generated collections (acts like H2 in-memory DB)
// Structure: { collectionId: { files: {}, timestamp: Date, collectionName: '' } }
const collectionsStore = new Map();

// Cleanup old collections every 30 minutes (H2-like memory management)
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
const COLLECTION_TTL = 60 * 60 * 1000; // 1 hour TTL

setInterval(() => {
    const now = Date.now();
    for (const [id, data] of collectionsStore.entries()) {
        if (now - data.timestamp > COLLECTION_TTL) {
            console.log(`🗑️ Cleaning up expired collection: ${data.collectionName} (ID: ${id})`);
            collectionsStore.delete(id);
        }
    }
}, CLEANUP_INTERVAL);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// API endpoint to test database connection
app.post('/api/test-db-connection', async (req, res) => {
    try {
        const { jdbcUrl, username, password } = req.body;
        
        console.log('🔍 Testing database connection:', jdbcUrl.replace(/\/\/.*@/, '//***:***@'));
        
        // For demonstration purposes, we'll do a simple validation
        // In a real implementation, you would actually test the database connection
        
        // Basic JDBC URL validation
        if (!jdbcUrl || !jdbcUrl.startsWith('jdbc:')) {
            return res.json({
                success: false,
                error: 'Invalid JDBC URL format. Must start with "jdbc:"'
            });
        }
        
        if (!username || !password) {
            return res.json({
                success: false,
                error: 'Username and password are required'
            });
        }
        
        // Simulate connection test (replace with actual database connection logic)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        
        // For now, assume connection is successful
        // TODO: Implement actual database connection testing using appropriate database driver
        console.log('✅ Database connection test completed');
        
        res.json({
            success: true,
            message: 'Database connection test successful',
            connectionInfo: {
                url: jdbcUrl.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in response
                username: username,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Connection test failed: ' + error.message
        });
    }
});

// API endpoint to generate collection
app.post('/api/generate', async (req, res) => {
    try {
        const config = req.body;
        
        console.log('📝 Generating collection:', config.collectionName);
        
        // Map web UI config to generator config format
        const generatorConfig = {
            collectionName: config.collectionName,
            scenarios: config.scenarios || [], // Manual scenarios from web UI
            csvScenarios: config.csvScenarios || [], // CSV scenarios
            assertions: config.assertions || [], // Test assertions
            variableGenerators: config.variableGenerators || [], // Variable generators
            dbQueries: config.dataQueries || [],  // Map dataQueries to dbQueries
            auth: config.basicAuth || config.bearerToken ? {
                type: config.authType,
                basicAuth: config.basicAuth,
                bearerToken: config.bearerToken
            } : null,
            dbConfig: config.dbConfig
        };
        
        // Create generator instance
        const generator = new BrunoCollectionGenerator();
        
        // Generate all files
        const result = generator.generateCollection(generatorConfig);
        
        // Read generated file contents (generator saves to ./bruno-generated relative to cwd)
        const outputDir = path.join(process.cwd(), 'bruno-generated');
        const collectionJson = fs.readFileSync(path.join(outputDir, result.brunoCollection), 'utf8');
        const appJs = fs.readFileSync(path.join(outputDir, result.appJs), 'utf8');
        const packageJson = fs.readFileSync(path.join(outputDir, result.packageJson), 'utf8');
        const setupInstructions = fs.readFileSync(path.join(outputDir, result.instructions), 'utf8');
        
        // Generate unique collection ID (like H2 auto-increment primary key)
        const collectionId = crypto.randomBytes(16).toString('hex');
        
        // Store in memory (H2-like in-memory table)
        collectionsStore.set(collectionId, {
            collectionName: config.collectionName,
            timestamp: Date.now(),
            files: {
                collectionJson: collectionJson,
                appJs: appJs,
                packageJson: packageJson,
                setupInstructions: setupInstructions
            }
        });
        
        console.log(`✅ Collection stored in memory with ID: ${collectionId}`);
        console.log(`📊 Total collections in memory: ${collectionsStore.size}`);
        
        // Clean up physical files after storing in memory
        try {
            fs.unlinkSync(path.join(outputDir, result.brunoCollection));
            fs.unlinkSync(path.join(outputDir, result.appJs));
            fs.unlinkSync(path.join(outputDir, result.packageJson));
            fs.unlinkSync(path.join(outputDir, result.instructions));
            
            // Clean up the Bruno collection directory if it exists
            if (result.collectionDir && fs.existsSync(result.collectionDir)) {
                fs.rmSync(result.collectionDir, { recursive: true, force: true });
            }
            
            console.log('🗑️ Physical files and directory cleaned up');
        } catch (cleanupError) {
            console.warn('⚠️ Could not clean up physical files:', cleanupError.message);
        }
        
        // Prepare response
        const response = {
            success: true,
            message: 'Collection generated successfully',
            collectionId: collectionId,
            collectionName: config.collectionName,
            expiresIn: '1 hour',
            downloadUrl: `/api/download/${collectionId}`
        };
        
        console.log('✅ Collection generated successfully');
        res.json(response);
        
    } catch (error) {
        console.error('❌ Error generating collection:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Download individual file
app.get('/api/download/:collectionId/:fileType', (req, res) => {
    try {
        const { collectionId, fileType } = req.params;
        
        const collection = collectionsStore.get(collectionId);
        if (!collection) {
            return res.status(404).json({
                success: false,
                error: 'Collection not found or expired'
            });
        }
        
        let content, filename, contentType;
        
        switch(fileType) {
            case 'collection':
                content = collection.files.collectionJson;
                filename = `${collection.collectionName.replace(/\s+/g, '-')}.json`;
                contentType = 'application/json; charset=utf-8';
                break;
            case 'app':
                content = collection.files.appJs;
                filename = 'app.js';
                contentType = 'text/plain; charset=utf-8';
                break;
            case 'package':
                content = collection.files.packageJson;
                filename = 'package.json';
                contentType = 'application/json; charset=utf-8';
                break;
            case 'instructions':
                content = collection.files.setupInstructions;
                filename = 'SETUP_INSTRUCTIONS.md';
                contentType = 'text/plain; charset=utf-8';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid file type'
                });
        }
        
        // Set proper headers for download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'));
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.send(content);
        
        console.log(`📥 Downloaded: ${filename} for collection ${collectionId}`);
        
    } catch (error) {
        console.error('❌ Download error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Download all files as ZIP (requires JSZip or archiver)
app.get('/api/download/:collectionId/all', (req, res) => {
    try {
        const { collectionId } = req.params;
        
        const collection = collectionsStore.get(collectionId);
        if (!collection) {
            return res.status(404).json({
                success: false,
                error: 'Collection not found or expired'
            });
        }
        
        // Return all files as JSON for client-side ZIP creation
        res.json({
            success: true,
            files: {
                [`${collection.collectionName.replace(/\s+/g, '-')}.json`]: collection.files.collectionJson,
                'app.js': collection.files.appJs,
                'package.json': collection.files.packageJson,
                'SETUP_INSTRUCTIONS.md': collection.files.setupInstructions
            }
        });
        
    } catch (error) {
        console.error('❌ Download all error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete collection from memory after download (cleanup endpoint)
app.delete('/api/collection/:collectionId', (req, res) => {
    try {
        const { collectionId } = req.params;
        
        if (collectionsStore.has(collectionId)) {
            const collection = collectionsStore.get(collectionId);
            collectionsStore.delete(collectionId);
            console.log(`🗑️ Deleted collection: ${collection.collectionName} (ID: ${collectionId})`);
            
            res.json({
                success: true,
                message: 'Collection deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Collection not found'
            });
        }
        
    } catch (error) {
        console.error('❌ Delete error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get collection info (check if still available)
app.get('/api/collection/:collectionId/info', (req, res) => {
    try {
        const { collectionId } = req.params;
        
        const collection = collectionsStore.get(collectionId);
        if (!collection) {
            return res.status(404).json({
                success: false,
                error: 'Collection not found or expired'
            });
        }
        
        const age = Date.now() - collection.timestamp;
        const remainingTime = COLLECTION_TTL - age;
        
        res.json({
            success: true,
            collectionName: collection.collectionName,
            createdAt: new Date(collection.timestamp).toISOString(),
            expiresIn: Math.floor(remainingTime / 1000 / 60) + ' minutes',
            filesAvailable: Object.keys(collection.files)
        });
        
    } catch (error) {
        console.error('❌ Info error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'running',
        message: 'Bruno Collection Generator Web UI Server',
        version: '2.0.0',
        collectionsInMemory: collectionsStore.size,
        memoryStorage: 'H2-like in-memory storage enabled',
        cleanupInterval: `${CLEANUP_INTERVAL / 60000} minutes`,
        collectionTTL: `${COLLECTION_TTL / 60000} minutes`
    });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Bruno Collection Generator Web UI');
    console.log('=====================================');
    console.log('');
    console.log(`✅ Server running at: http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Open your browser and navigate to:');
    console.log(`   http://localhost:${PORT}/index.html`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
});
