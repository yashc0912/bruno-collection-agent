# 🤖 AI-Powered API Test Generator

**Zero scripting required. Just provide URL + Payload → AI generates complete test suite**

---

## 🚀 Quick Start

### Option 1: Interactive Mode (Easiest)

Just paste your API details:

```bash
node ai-test-generator.js
```

Then provide:
- ✅ API URL
- ✅ Request Payload (JSON)
- ✅ Expected Response (optional)

**AI does the rest!**

---

## 📋 What You Provide (Minimal Input)

```javascript
{
  name: "Create Contract",
  url: "https://api.example.com/v1/createContract",
  method: "POST",
  payload: {
    contractId: "12345",
    customerName: "Yash",
    status: "ACTIVE"
  }
}
```

---

## 🎁 What AI Generates (Automatically)

### 1. **Playwright Test Suite** (.spec.js)
- ✅ Positive test cases
- ❌ Negative test cases (invalid data, missing auth)
- 🔍 Edge cases (empty payload, boundary values)
- ⚡ Performance assertions (response time)
- 📊 Comprehensive logging

### 2. **Bruno API File** (.bru)
- Ready-to-run Bruno test
- Pre-configured assertions
- Environment variables support
- Response validation scripts

### 3. **Test Variations**
AI automatically creates:
- Valid request test
- Invalid payload test
- Unauthorized access test
- Empty payload test
- Timeout test
- And more...

---

## 💡 Usage Examples

### Example 1: Simple POST API

```javascript
const AITestGenerator = require('./ai-test-generator');
const generator = new AITestGenerator();

generator.generateTest({
  name: "User Registration",
  url: "https://api.example.com/register",
  method: "POST",
  payload: {
    username: "john_doe",
    email: "john@example.com",
    password: "SecurePass123"
  },
  assertions: [
    { type: 'status', value: 201, operator: 'toBe' },
    { type: 'body', field: 'userId', value: null, operator: 'toBeDefined' }
  ]
});
```

**AI Generates:**
- ✅ Valid registration test
- ❌ Duplicate username test
- ❌ Invalid email format test
- ❌ Weak password test
- ❌ Missing required fields test

---

### Example 2: With Authentication

```javascript
generator.generateTest({
  name: "Get User Profile",
  url: "https://api.example.com/user/profile",
  method: "GET",
  auth: {
    type: "bearer",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  assertions: [
    { type: 'status', value: 200, operator: 'toBe' },
    { type: 'body', field: 'username', value: 'john_doe', operator: 'toBe' }
  ]
});
```

**AI Generates:**
- ✅ Authorized request test
- ❌ Expired token test
- ❌ Invalid token test
- ❌ Missing token test

---

### Example 3: Generate Full Suite from Collection

```javascript
const apiCollection = [
  {
    name: "Create Order",
    url: "https://api.example.com/orders",
    method: "POST",
    payload: { items: [1, 2, 3], total: 99.99 }
  },
  {
    name: "Get Order",
    url: "https://api.example.com/orders/123",
    method: "GET"
  },
  {
    name: "Cancel Order",
    url: "https://api.example.com/orders/123/cancel",
    method: "POST"
  }
];

generator.generateTestSuite(apiCollection);
```

**AI Generates:**
- 📁 Complete test suite with 3 test files
- ✅ All positive scenarios
- ❌ All negative scenarios
- 🔗 Chained tests (create → get → cancel)

---

## 🎯 AI Features (Automatic)

| Feature | What AI Does |
|---------|-------------|
| 🧪 **Test Variations** | Creates positive, negative, and edge case tests |
| 🔐 **Auth Handling** | Supports Basic, Bearer, API Key authentication |
| 📊 **Assertions** | Auto-generates status, body, and time validations |
| 🔄 **Dynamic Data** | Converts static values to variables ({{$randomUUID}}) |
| 📝 **Documentation** | Adds comments and descriptions to all tests |
| 🎨 **Multi-Format** | Generates both Playwright and Bruno formats |
| ⚡ **Performance** | Includes response time checks |
| 🐛 **Error Cases** | Auto-creates invalid payload scenarios |

---

## 🛠️ Authentication Types Supported

### Basic Auth
```javascript
auth: {
  type: 'basic',
  username: 'user',
  password: 'pass'
}
```

### Bearer Token
```javascript
auth: {
  type: 'bearer',
  token: 'your-jwt-token'
}
```

### API Key
```javascript
auth: {
  type: 'apikey',
  key: 'your-api-key',
  headerName: 'X-API-Key'  // optional, defaults to X-API-Key
}
```

---

## 📊 Output Structure

```
tests/
└── generated/
    ├── create-contract.spec.js    (Playwright test)
    ├── create-contract.bru        (Bruno test)
    ├── user-registration.spec.js
    ├── user-registration.bru
    └── ...
```

---

## 🚀 Run Generated Tests

### Playwright
```bash
npx playwright test tests/generated
```

### Bruno
```bash
bruno run tests/generated/create-contract.bru
```

### With HTML Report
```bash
npx playwright test tests/generated --reporter=html
npx playwright show-report
```

---

## 🎓 Step-by-Step Tutorial

### Step 1: Provide Your API Details
```javascript
const myAPI = {
  name: "My API Test",
  url: "https://your-api.com/endpoint",
  method: "POST",
  payload: { /* your payload */ }
};
```

### Step 2: Generate Tests
```javascript
const generator = new AITestGenerator();
generator.generateTest(myAPI);
```

### Step 3: Run & View Results
```bash
npx playwright test tests/generated --reporter=html
npx playwright show-report
```

**That's it!** No manual test scripting needed.

---

## 🌟 Benefits

✅ **Save 90% Time** - No manual test writing
✅ **Better Coverage** - AI generates edge cases you might miss
✅ **Consistent** - All tests follow best practices
✅ **Maintainable** - Clean, commented code
✅ **Multiple Formats** - Playwright + Bruno simultaneously
✅ **Enterprise Ready** - Handles auth, assertions, logging

---

## 🎯 Use Cases

1. **Quick API Testing** - Validate new endpoints fast
2. **Regression Testing** - Auto-generate test suites
3. **Load Testing Prep** - Create base tests for K6/JMeter
4. **API Documentation** - Use tests as living docs
5. **CI/CD Integration** - Auto-generate pipeline tests

---

## 📞 Support

Need help? Just tell AI:
- "Generate test for my API"
- "Add authentication to this test"
- "Create negative test cases"
- "Convert to Bruno format"

AI handles everything!

---

## 🎉 Example Output

When you run the generator, you'll see:

```
🤖 AI Test Generator - Starting...

Generating tests for: Create Contract API
✅ Generated test: tests/generated/create-contract.spec.js
✅ Generated Bruno file: tests/generated/create-contract.bru

✅ Generated 1 test suites
📁 Location: ./tests/generated

Test Breakdown:
  ✅ 1 positive test
  ❌ 2 negative tests
  🔍 1 edge case test
  📊 5 assertions
  ⏱️ Performance checks included
```

---

**Ready to start? Just share your API details!** 🚀
