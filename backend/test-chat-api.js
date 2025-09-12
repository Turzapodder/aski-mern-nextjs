// Simple test script to verify chat API endpoints
// Run this after starting the server to test the chat functionality

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000';
const TEST_TOKEN = 'your_jwt_token_here'; // Replace with actual JWT token

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TEST_TOKEN}`
};

// Test functions
async function testCreateChat() {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Test Chat',
        description: 'A test chat room',
        type: 'group',
        participants: [] // Add user IDs here
      })
    });
    
    const data = await response.json();
    console.log('Create Chat Response:', data);
    return data.chat?._id;
  } catch (error) {
    console.error('Create Chat Error:', error.message);
  }
}

async function testGetChats() {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/list`, {
      headers
    });
    
    const data = await response.json();
    console.log('Get Chats Response:', data);
  } catch (error) {
    console.error('Get Chats Error:', error.message);
  }
}

async function testSendMessage(chatId) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/${chatId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: 'Hello from test script!',
        type: 'text'
      })
    });
    
    const data = await response.json();
    console.log('Send Message Response:', data);
  } catch (error) {
    console.error('Send Message Error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Testing Chat API Endpoints...');
  console.log('⚠️  Make sure to replace TEST_TOKEN with a valid JWT token');
  
  // Test create chat
  console.log('\n1. Testing Create Chat...');
  const chatId = await testCreateChat();
  
  // Test get chats
  console.log('\n2. Testing Get Chats...');
  await testGetChats();
  
  // Test send message (if chat was created successfully)
  if (chatId) {
    console.log('\n3. Testing Send Message...');
    await testSendMessage(chatId);
  }
  
  console.log('\n✅ Test completed!');
}

// Uncomment the line below to run tests
// runTests();

console.log('Chat API Test Script Ready!');
console.log('To run tests:');
console.log('1. Replace TEST_TOKEN with a valid JWT token');
console.log('2. Uncomment the runTests() call at the bottom');
console.log('3. Run: node test-chat-api.js');

export { testCreateChat, testGetChats, testSendMessage, runTests };