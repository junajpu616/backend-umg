const axios = require('axios');

// Base URL for your API
const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'Test123456',
  name: 'Test User'
};

const testProduct = {
  nombre: 'Test Product',
  precio: 99.99,
  stock: true
};

// Test results storage
const testResults = [];

// Helper function to run tests
async function runTest(testName, testFunction) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    await testFunction();
    console.log(`✅ ${testName} - PASSED`);
    testResults.push({ test: testName, status: 'PASSED' });
  } catch (error) {
    console.log(`❌ ${testName} - FAILED`);
    console.log(`   Error: ${error.message}`);
    testResults.push({ test: testName, status: 'FAILED', error: error.message });
  }
}

// Authentication Tests
async function testAuthEndpoints() {
  let authToken = null;

  await runTest('POST /api/auth/register', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    if (response.status !== 201) throw new Error('Registration failed');
  });

  await runTest('POST /api/auth/login', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    if (response.status !== 200) throw new Error('Login failed');
    authToken = response.data.token;
    if (!authToken) throw new Error('No token received');
  });

  await runTest('GET /api/auth/me', async () => {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error('Get user profile failed');
  });

  return authToken;
}

// Product Tests
async function testProductEndpoints(authToken) {
  let productId = null;

  await runTest('GET /api/products (empty list)', async () => {
    const response = await axios.get(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error('Get products failed');
  });

  await runTest('POST /api/products', async () => {
    const response = await axios.post(`${BASE_URL}/api/products`, testProduct, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 201) throw new Error('Create product failed');
    productId = response.data.id;
  });

  await runTest('GET /api/products/:id', async () => {
    const response = await axios.get(`${BASE_URL}/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error('Get product by ID failed');
  });

  await runTest('PUT /api/products/:id', async () => {
    const updatedProduct = { ...testProduct, nombre: 'Updated Product' };
    const response = await axios.put(`${BASE_URL}/api/products/${productId}`, updatedProduct, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error('Update product failed');
  });

  await runTest('DELETE /api/products/:id', async () => {
    const response = await axios.delete(`${BASE_URL}/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error('Delete product failed');
  });
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting endpoint tests...\n');
  
  try {
    // Test authentication endpoints
    const authToken = await testAuthEndpoints();
    
    // Test product endpoints
    await testProductEndpoints(authToken);
    
    // Print summary
    console.log('\n📊 Test Summary:');
    const passed = testResults.filter(r => r.status === 'PASSED').length;
    const failed = testResults.filter(r => r.status === 'FAILED').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${testResults.length}`);
    
    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      testResults.filter(r => r.status === 'FAILED').forEach(r => {
        console.log(`   - ${r.test}: ${r.error}`);
      });
    }
    
  } catch (error) {
    console.error('Test suite failed:', error.message);
  }
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/auth/register`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start it with `npm run dev` first');
    return false;
  }
}

// Export for use
module.exports = { runAllTests, checkServer };

// Run tests if this file is executed directly
if (require.main === module) {
  checkServer().then(isRunning => {
    if (isRunning) {
      runAllTests();
    }
  });
}
