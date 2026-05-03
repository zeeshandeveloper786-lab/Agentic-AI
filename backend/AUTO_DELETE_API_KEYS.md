# Auto-Delete Old API Keys Feature

## Overview
Is feature mein jab user kisi agent ka model provider change karta hai ya koi built-in tool delete karta hai, to purani API keys automatically delete ho jati hain database se.

## Changes Made

### 1. Agent Controller (`agent.controller.js`)

**Location:** `updateAgent` function

**Functionality:**
- Jab user agent update karta hai aur `modelProvider` change hota hai (e.g., OpenAI se Gemini), to:
  1. Pehle current agent ka data fetch karta hai
  2. Check karta hai ke `modelProvider` change ho raha hai ya nahi
  3. Agar change ho raha hai, to purani provider ki API key delete kar deta hai
  4. Phir agent ko update karta hai

**Example:**
```javascript
// Agar agent pehle OpenAI use kar raha tha
// Aur ab Gemini mein change ho raha hai
// To OpenAI ki API key automatically delete ho jayegi
```

**Code Logic:**
```javascript
if (updateData.modelProvider && updateData.modelProvider !== currentAgent.modelProvider) {
    console.log(`🔄 Model provider changing from ${currentAgent.modelProvider} to ${updateData.modelProvider}`);
    
    // Delete the old provider's API key
    await prisma.apiKey.deleteMany({
        where: {
            userId,
            provider: currentAgent.modelProvider
        }
    });
}
```

### 2. Tool Controller (`tool.controller.js`)

**Location:** `deleteTool` function

**Functionality:**
- Jab user koi built-in tool delete karta hai, to uski associated API key bhi delete ho jati hai
- Supported tools:
  - `tavily_search` → deletes `tavily` API key
  - `weather` → deletes `weather` and `openweathermap` API keys

**Code Logic:**
```javascript
if (tool.toolType === 'BUILT_IN') {
    const toolNameLower = tool.name.toLowerCase();
    
    if (toolNameLower === 'tavily_search') {
        // Delete tavily API key
    } else if (toolNameLower === 'weather') {
        // Delete weather/openweathermap API keys
    }
}
```

## Benefits

1. **Clean Database:** Purani unused API keys database mein nahi rahti
2. **Security:** Unused API keys automatically remove ho jati hain
3. **User Experience:** User ko manually API keys delete nahi karni padti
4. **Automatic Cleanup:** Jab provider change ho, automatically cleanup ho jata hai

## Error Handling

- Agar API key deletion fail ho jaye, to bhi agent/tool update/delete continue hota hai
- Console mein warning log hoti hai agar deletion fail ho
- User ko seamless experience milta hai

## Testing Scenarios

### Test 1: Model Provider Change
1. Agent create karo with OpenAI
2. OpenAI API key add karo
3. Agent update karo aur provider Gemini mein change karo
4. **Expected:** OpenAI API key automatically delete ho jayegi

### Test 2: Tool Deletion
1. Agent mein Tavily tool add karo
2. Tavily API key add karo
3. Tavily tool delete karo
4. **Expected:** Tavily API key automatically delete ho jayegi

### Test 3: Weather Tool Special Case
1. Weather tool add karo
2. `weather` ya `openweathermap` API key add karo
3. Weather tool delete karo
4. **Expected:** Dono possible API keys delete ho jayengi

## Database Schema
No changes required in Prisma schema. Existing `ApiKey` model ka `@@unique([userId, provider])` constraint already proper cleanup ensure karta hai.

## Logs
Console mein helpful logs add kiye gaye hain:
- `🔄 Model provider changing from X to Y`
- `✅ Deleted old API key for provider: X`
- `⚠️ Could not delete old API key for X: error`

## Future Enhancements
- Custom tools ke liye bhi similar logic add kar sakte hain
- API key deletion history track kar sakte hain
- User ko notification dikha sakte hain jab API key delete ho
