# Backend Requirements for Multi-Chat Session Feature

## Overview
ChatGPT jaisa multi-chat session system implement karne ke liye backend mein ye changes chahiye.

## Database Schema Changes

### New Table: `chat_sessions`
```sql
CREATE TABLE chat_sessions (
    id VARCHAR(255) PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);
```

### Modified Table: `messages` (ya jo bhi aapka message table hai)
```sql
ALTER TABLE messages ADD COLUMN session_id VARCHAR(255);
ALTER TABLE messages ADD FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE;
```

## Required API Endpoints

### 1. Get All Chat Sessions for an Agent
**Endpoint:** `GET /chat/sessions/:agentId`

**Response:**
```json
{
    "sessions": [
        {
            "id": "session_123",
            "agentId": "agent_456",
            "title": "Discussion about AI",
            "createdAt": "2026-01-07T10:30:00Z",
            "updatedAt": "2026-01-07T11:45:00Z",
            "messageCount": 15,
            "lastMessage": "Thank you for the explanation"
        }
    ]
}
```

**Logic:**
- Agent ID ke saare sessions return karo
- Latest sessions pehle (ORDER BY updated_at DESC)
- Har session ke saath last message ka preview bhi do

### 2. Create New Chat Session
**Endpoint:** `POST /chat/sessions`

**Request Body:**
```json
{
    "agentId": "agent_456"
}
```

**Response:**
```json
{
    "session": {
        "id": "session_789",
        "agentId": "agent_456",
        "title": "New Chat",
        "createdAt": "2026-01-07T12:00:00Z",
        "messages": []
    }
}
```

**Logic:**
- Naya session create karo
- Default title "New Chat" rakho
- Empty messages array return karo

### 3. Get Messages for a Specific Session
**Endpoint:** `GET /chat/sessions/:sessionId/messages`

**Response:**
```json
{
    "messages": [
        {
            "role": "user",
            "content": "Hello",
            "timestamp": "2026-01-07T10:30:00Z"
        },
        {
            "role": "assistant",
            "content": "Hi! How can I help?",
            "timestamp": "2026-01-07T10:30:05Z"
        }
    ]
}
```

### 4. Send Message (Modified)
**Endpoint:** `POST /chat`

**Request Body:**
```json
{
    "agentId": "agent_456",
    "sessionId": "session_123",
    "message": "What is AI?"
}
```

**Response:**
```json
{
    "response": "AI stands for Artificial Intelligence...",
    "sessionId": "session_123"
}
```

**Logic:**
- Message ko specific session mein save karo
- Session ka `updated_at` update karo
- Agar session ka title "New Chat" hai aur ye pehla message hai, to title ko first message se generate karo (first 50 characters)

### 5. Delete Chat Session
**Endpoint:** `DELETE /chat/sessions/:sessionId`

**Response:**
```json
{
    "message": "Session deleted successfully"
}
```

**Logic:**
- Session aur uske saare messages delete karo (CASCADE)

### 6. Update Session Title
**Endpoint:** `PATCH /chat/sessions/:sessionId`

**Request Body:**
```json
{
    "title": "AI Discussion - Part 1"
}
```

**Response:**
```json
{
    "session": {
        "id": "session_123",
        "title": "AI Discussion - Part 1",
        "updatedAt": "2026-01-07T12:30:00Z"
    }
}
```

## Auto-Title Generation (Optional but Recommended)

Jab user pehli baar message bhejta hai new session mein:
1. Message content ke pehle 40-50 characters ko title bana do
2. Agar message bahut lamba hai, to "..." add kar do end mein
3. Special characters aur emojis remove kar do

Example:
- Message: "Can you explain how neural networks work in detail?"
- Generated Title: "Can you explain how neural networks work..."

## Migration Steps

1. **Database Migration:**
   - `chat_sessions` table create karo
   - Existing messages ko default session mein migrate karo (har agent ke liye ek default session)

2. **API Updates:**
   - Saare endpoints implement karo
   - Purane `/chat/:agentId` endpoint ko maintain karo backward compatibility ke liye

3. **Testing:**
   - Multiple sessions create karke test karo
   - Session switching test karo
   - Message sending test karo different sessions mein

## Example Flow

1. User agent page kholta hai → Frontend `GET /chat/sessions/:agentId` call karega
2. User "New Chat" button dabata hai → Frontend `POST /chat/sessions` call karega
3. User message bhejta hai → Frontend `POST /chat` with sessionId call karega
4. User purani chat select karta hai → Frontend `GET /chat/sessions/:sessionId/messages` call karega

## Notes
- Session IDs unique honi chahiye (UUID use karo)
- Har session ka apna message history hoga
- User multiple sessions parallel mein rakh sakta hai
- Sessions ko timestamp se sort karo (latest first)
