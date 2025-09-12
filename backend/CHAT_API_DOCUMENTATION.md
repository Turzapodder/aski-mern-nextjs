# Real-time Chat API Documentation

## Overview
This backend provides a complete real-time chat system with REST API endpoints and Socket.IO for real-time communication. It supports text messages, file uploads (images, PDFs, DOCX), typing indicators, read receipts, and user presence.

## Installation

1. Install new dependencies:
```bash
npm install socket.io multer
```

2. Create uploads directory:
```bash
mkdir -p uploads/chat-files
```

## Environment Variables
Make sure these are set in your `.env` file:
```
JWT_ACCESS_TOKEN_SECRET_KEY=your_jwt_secret
FRONTEND_HOST=http://localhost:3000
```

## REST API Endpoints

### Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Chat Management

#### Create Chat
```
POST /api/chat/create
Content-Type: application/json

{
  "name": "Study Group",
  "description": "Computer Science study group",
  "type": "group", // "direct" or "group"
  "participants": ["userId1", "userId2"] // Array of user IDs
}
```

#### Get User's Chats
```
GET /api/chat/list?page=1&limit=20
```

#### Get Chat Details
```
GET /api/chat/:chatId
```

#### Add Participants
```
POST /api/chat/:chatId/participants
Content-Type: application/json

{
  "participants": ["userId1", "userId2"]
}
```

#### Remove Participant
```
DELETE /api/chat/:chatId/participants/:participantId
```

#### Leave Chat
```
POST /api/chat/:chatId/leave
```

### Message Management

#### Send Text Message
```
POST /api/chat/:chatId/messages
Content-Type: application/json

{
  "content": "Hello everyone!",
  "replyTo": "messageId" // Optional
}
```

#### Send File Message
```
POST /api/chat/:chatId/messages/file
Content-Type: multipart/form-data

Form data:
- files: File[] (max 5 files, 10MB each)
- content: string (optional caption)
- replyTo: string (optional message ID)
```

#### Get Chat Messages
```
GET /api/chat/:chatId/messages?page=1&limit=50
```

#### Mark Messages as Read
```
POST /api/chat/:chatId/messages/read
```

#### Edit Message
```
PUT /api/chat/messages/:messageId
Content-Type: application/json

{
  "content": "Updated message content"
}
```

#### Delete Message
```
DELETE /api/chat/messages/:messageId
```

## Socket.IO Events

### Connection
Connect with JWT token:
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Client Events (Emit)

#### Send Message
```javascript
socket.emit('send_message', {
  chatId: 'chatId',
  content: 'Hello!',
  type: 'text', // 'text', 'file', 'image'
  replyTo: 'messageId' // optional
});
```

#### Join Chat
```javascript
socket.emit('join_chat', {
  chatId: 'chatId'
});
```

#### Leave Chat
```javascript
socket.emit('leave_chat', {
  chatId: 'chatId'
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing_start', {
  chatId: 'chatId'
});

// Stop typing
socket.emit('typing_stop', {
  chatId: 'chatId'
});
```

#### Mark Messages as Read
```javascript
socket.emit('mark_messages_read', {
  chatId: 'chatId'
});
```

#### Update Presence
```javascript
socket.emit('update_presence', {
  status: 'online' // 'online', 'away', 'busy'
});
```

### Server Events (Listen)

#### New Message
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  console.log('In chat:', data.chatId);
});
```

#### Typing Indicators
```javascript
socket.on('user_typing', (data) => {
  console.log(`${data.userName} is typing in ${data.chatId}`);
});

socket.on('user_stopped_typing', (data) => {
  console.log(`User stopped typing in ${data.chatId}`);
});
```

#### Read Receipts
```javascript
socket.on('messages_read', (data) => {
  console.log(`User ${data.userId} read messages in ${data.chatId}`);
});
```

#### User Presence
```javascript
socket.on('user_presence_updated', (data) => {
  console.log(`User ${data.userId} is now ${data.status}`);
});
```

#### Chat Events
```javascript
socket.on('joined_chat', (data) => {
  console.log('Joined chat:', data.chatId);
});

socket.on('left_chat', (data) => {
  console.log('Left chat:', data.chatId);
});
```

#### Error Handling
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
});
```

## Data Models

### Chat Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  type: 'direct' | 'group',
  participants: [{
    user: ObjectId,
    role: 'admin' | 'member',
    joinedAt: Date
  }],
  createdBy: ObjectId,
  avatar: String,
  isActive: Boolean,
  lastMessage: ObjectId,
  lastActivity: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  chat: ObjectId,
  sender: ObjectId,
  content: String,
  type: 'text' | 'file' | 'image',
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: Date
  }],
  readBy: [{
    user: ObjectId,
    readAt: Date
  }],
  editedAt: Date,
  isDeleted: Boolean,
  deletedAt: Date,
  replyTo: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## File Upload Support

### Supported File Types
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, DOCX, DOC
- Maximum file size: 10MB per file
- Maximum files per message: 5

### File URLs
Uploaded files are accessible at:
```
http://localhost:5000/uploads/chat-files/{filename}
```

## Error Responses

All API endpoints return errors in this format:
```javascript
{
  "status": "failed",
  "message": "Error description"
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Frontend Integration Example

```javascript
// Initialize Socket.IO
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});

// Join a chat
socket.emit('join_chat', { chatId: 'your-chat-id' });

// Send a message
const sendMessage = (chatId, content) => {
  socket.emit('send_message', {
    chatId,
    content,
    type: 'text'
  });
};

// Listen for new messages
socket.on('new_message', (data) => {
  // Update your chat UI with the new message
  addMessageToChat(data.message);
});

// Handle typing indicators
socket.on('user_typing', (data) => {
  showTypingIndicator(data.chatId, data.userName);
});

socket.on('user_stopped_typing', (data) => {
  hideTypingIndicator(data.chatId, data.userId);
});
```

This completes the real-time chat backend implementation. The system is now ready for frontend integration!