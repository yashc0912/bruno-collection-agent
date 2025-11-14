# Download Troubleshooting Guide

## Issue: Cannot Open Downloaded Files

This guide helps you resolve issues when downloaded files cannot be opened or are corrupted.

## Common Causes and Solutions

### 1. **File Extension Issues**
**Problem**: Files download without proper extensions or with wrong extensions.

**Solutions**:
- **Check Downloads Folder**: Look in your browser's default downloads folder (usually `C:\Users\YourName\Downloads`)
- **Rename Files**: If files downloaded without extensions, rename them:
  - Collection file: Add `.bru` extension
  - App file: Add `.js` extension  
  - Package file: Add `.json` extension
  - Instructions: Add `.md` extension

### 2. **Browser Security Settings**
**Problem**: Browser blocks downloads or saves them as `.txt` files.

**Solutions**:
- **Allow Downloads**: 
  - Chrome: Settings > Privacy and Security > Site Settings > Additional permissions > Automatic downloads
  - Edge: Settings > Cookies and site permissions > Additional permissions > Automatic downloads
  - Firefox: Settings > General > Files and Applications

- **Disable Safe Browsing** (temporarily):
  - Chrome: Settings > Privacy and Security > Security > Safe Browsing (disable temporarily)

### 3. **Windows File Association Issues**
**Problem**: Windows doesn't know which program to use to open the files.

**Solutions**:
- **For .bru files**: Open with any text editor (Notepad++, VS Code, Notepad)
- **For .js files**: Open with text editor or IDE (VS Code, Notepad++)
- **For .json files**: Open with text editor or JSON viewer
- **For .md files**: Open with Markdown viewer or text editor

### 4. **Content Type Issues**
**Problem**: Browser receives wrong MIME type and corrupts the file.

**Solutions**:
- Try downloading individual files instead of all at once
- Use "Save As" from browser menu instead of direct download
- Clear browser cache and try again

### 5. **Antivirus Interference**
**Problem**: Antivirus software blocks or quarantines downloaded files.

**Solutions**:
- Check your antivirus quarantine folder
- Temporarily disable real-time protection
- Add the website to antivirus whitelist

## Step-by-Step Troubleshooting

### Step 1: Verify Download Location
1. Open your browser's download history (Ctrl+J in most browsers)
2. Check if files were actually downloaded
3. Note the file location and size

### Step 2: Check File Properties
1. Right-click on downloaded file
2. Select "Properties"
3. Verify file size is not 0 bytes
4. Check if file has proper extension

### Step 3: Try Alternative Download Method
1. Open browser developer tools (F12)
2. Go to Console tab
3. Type: `diagnoseDownloadIssues()` and press Enter
4. Review the diagnostic information

### Step 4: Manual Download
If automatic download fails:
1. Right-click on download button
2. Select "Save link as..." or "Save target as..."
3. Choose location and verify filename has correct extension

## Browser-Specific Solutions

### Google Chrome
- **Settings**: chrome://settings/content/automaticDownloads
- **Enable**: "Sites can ask to automatically download multiple files"
- **Clear Data**: Chrome menu > More tools > Clear browsing data

### Microsoft Edge
- **Settings**: edge://settings/content/automaticDownloads  
- **Allow**: "Ask when a site tries to automatically download files after the first file"

### Firefox
- **Settings**: about:preferences#general
- **Applications**: Configure how Firefox handles different file types

## Alternative Access Methods

If downloads still fail, you can:

1. **Copy Content Manually**:
   - Open browser developer tools
   - Check Network tab for successful API responses
   - Copy content from response body

2. **Use Different Browser**:
   - Try downloading with Chrome, Edge, or Firefox
   - Some browsers handle downloads differently

3. **Contact Support**:
   - Provide browser version and operating system
   - Include any console error messages
   - Share diagnostic output from `diagnoseDownloadIssues()`

## Verification Steps

After downloading, verify files:

### Collection File (.bru)
```
meta {
  name: YourCollectionName
  type: http
  seq: 1
}
```

### App File (.js)
```javascript
const axios = require('axios');
const mysql = require('mysql2/promise');
```

### Package File (.json)
```json
{
  "name": "your-collection-name",
  "version": "1.0.0",
  "dependencies": {
```

### Instructions (.md)
```markdown
# Setup Instructions for YourCollectionName
```

## Prevention Tips

1. **Browser Settings**: Configure your browser to always ask where to save downloads
2. **Folder Permissions**: Ensure your Downloads folder has write permissions  
3. **Extension Association**: Set up proper file associations in Windows
4. **Regular Updates**: Keep your browser updated to latest version

## Still Having Issues?

If none of these solutions work:

1. **Check Console**: Open browser developer tools (F12) and look for error messages
2. **Network Issues**: Verify you have stable internet connection
3. **Server Status**: Ensure the web server is running (check http://localhost:3001/api/health)
4. **File Corruption**: Try generating and downloading a new collection

## Contact Information

For additional support, provide:
- Browser name and version
- Operating system
- Error messages (if any)
- Output from `diagnoseDownloadIssues()` function
- Steps you've already tried