# Contributing to Bruno Collection Generator

Thank you for your interest in contributing to the Bruno Collection Generator! We welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites

- Node.js v14.0.0 or higher
- npm v6.0.0 or higher
- Git

### Setup Development Environment

1. **Fork the repository**
   - Click the "Fork" button at the top right of the repository page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bruno-collection-generator.git
   cd bruno-collection-generator
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/yashc0912/bruno-collection-generator.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Install Playwright browsers**
   ```bash
   npx playwright install --with-deps
   ```

## 📋 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/web-ui-sanity.spec.js

# Run tests in UI mode (interactive)
npx playwright test --ui
```

### 4. Commit Your Changes

Follow conventional commit messages:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in generator"
git commit -m "docs: update README with examples"
git commit -m "test: add tests for API endpoint"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Maintain, dependencies, etc.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit the pull request

## 🧪 Testing Guidelines

### Writing Tests

- Place tests in the `tests/` directory
- Use descriptive test names
- Test both positive and negative scenarios
- Include edge cases

Example test structure:
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:3001');
    
    // Act
    await page.click('#button-id');
    
    // Assert
    await expect(page.locator('#result')).toBeVisible();
  });
});
```

### Running Tests Locally

```bash
# Run all tests
npm test

# Run with headed browser
npx playwright test --headed

# Run specific test
npx playwright test tests/web-ui-sanity.spec.js

# Debug mode
npx playwright test --debug
```

## 📝 Code Style Guidelines

### JavaScript

- Use ES6+ features where appropriate
- Use `const` for constants, `let` for variables
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Add semicolons at the end of statements

### File Organization

```
bruno-collection-generator/
├── web-ui/           # Web UI files
├── tests/            # Test files
├── examples/         # Example configurations
├── docs/             # Documentation
└── *.js              # Core logic files
```

### Comments

- Add JSDoc comments for functions
- Explain "why" not "what" in inline comments
- Keep comments up-to-date with code changes

Example:
```javascript
/**
 * Generates Bruno API test collection
 * @param {Object} config - Configuration object
 * @param {string} config.collectionName - Name of the collection
 * @param {string} config.apiUrl - API endpoint URL
 * @returns {Object} Generated collection data
 */
function generateCollection(config) {
  // Implementation
}
```

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues
2. Verify you're using the latest version
3. Test with a minimal reproduction

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g., Windows 10, macOS 12.0]
- Node.js version: [e.g., 18.0.0]
- npm version: [e.g., 8.0.0]
- Browser: [e.g., Chrome 120]

**Screenshots**
If applicable, add screenshots.

**Additional Context**
Any other relevant information.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Problem Statement**
Describe the problem you're trying to solve.

**Proposed Solution**
Describe your proposed solution.

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Any other relevant information.
```

## 📖 Documentation

### Documentation Updates

- Update README.md for user-facing changes
- Add/update guides in `docs/` for new features
- Include code examples
- Keep documentation clear and concise

### Documentation Structure

- **README.md**: Main entry point
- **docs/**: Detailed guides
- **examples/**: Working examples
- **Inline comments**: Code documentation

## 🔍 Code Review Process

### What We Look For

✅ **Good**
- Clean, readable code
- Proper error handling
- Tests included
- Documentation updated
- Follows project conventions

❌ **Avoid**
- Large, unfocused PRs
- Breaking changes without discussion
- Missing tests
- Undocumented complex logic

### Review Timeline

- Initial review: Within 1-3 days
- Follow-up reviews: Within 1-2 days
- Merge: After approval and CI passes

## 🏆 Recognition

Contributors will be:
- Listed in the project's contributors
- Mentioned in release notes
- Recognized in the README (for significant contributions)

## 📞 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Chat**: Join our community (if applicable)

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community

**Unacceptable behavior:**
- Harassment, trolling, or derogatory comments
- Publishing private information
- Other unprofessional conduct

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort!

**Happy coding! 🚀**
