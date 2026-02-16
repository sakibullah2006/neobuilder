## 📘 Software Requirements Specification (SRS)

### 1. Product Vision

NeoBuilder is a "Lead-First" chatbot builder. It targets local businesses that need to automate customer support and lead capture but want the ability to intervene in high-stakes conversations.

### 2. The Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui.
- **Authentication:** **Better-auth** (integrated with your Postgres DB).
- **Logic & Automation:** **n8n** (Self-hosted via Docker).
- **Database:** Supabase/PostgreSQL (with **pgvector** enabled for AI memory).
- **Chat Widget:** Custom Preact/React component (embedded via `<script>`).

---

### 3. System Architecture

The system operates on a "Triad" model: the **Portal** handles management, **n8n** handles the brain, and the **Widget** handles the interaction.

---

### 4. Database Schema

This schema supports multi-tenancy (multiple users), knowledge isolation, and the live takeover feature.

```sql
-- 1. Bot Configuration
CREATE TABLE chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- Better-auth User ID
  name TEXT,
  system_prompt TEXT, -- General personality
  calendly_link TEXT,
  discount_code TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 2. Conversations (The "Inbox")
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES chatbots(id),
  visitor_id TEXT, -- Fingerprint/Session ID
  is_human_controlled BOOLEAN DEFAULT false, -- Takeover Flag
  status TEXT DEFAULT 'active', -- 'active' or 'archived'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Messages (History)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  sender TEXT, -- 'ai', 'visitor', or 'admin'
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Knowledge (Vector Storage)
CREATE TABLE bot_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES chatbots(id),
  content TEXT,
  embedding VECTOR(1536) -- For pgvector search
);
```

## 5. Core Feature Modules

### A. The "Easy Feed" Knowledge Engine

- **Input:** User pastes a URL or uploads a PDF in the Dashboard.
- **n8n Workflow:** 1. Receive Webhook from Next.js.
    
    2.  Scrape/Parse content.
    
    3.  Chunk text into segments.
    
    4.  Generate Embeddings (OpenAI).
    
    5.  Save to `bot_knowledge` with the associated `bot_id`.
    

### B. The Hybrid Chat Logic (n8n)

This is the core "Switch" that allows for human takeover.

1. **Incoming Message:** Received via Webhook.
2. **Check Status:** n8n queries the `conversations` table for `is_human_controlled`.
3. **Route A (False):** n8n performs a vector search on the knowledge base $\rightarrow$ Sends context to LLM $\rightarrow$ Sends AI reply to widget.
4. **Route B (True):** n8n stops execution. The visitor's message is saved to the DB, and the Admin is notified to reply manually.

### C. Live Takeover Dashboard

- **Real-time Feed:** Using Supabase Realtime, the admin sees messages appear as they happen.
- **The Switch:** Clicking "Take Control" sends an API call to set `is_human_controlled = true`.
- **Live Reply:** Admin types in a text box; the message is saved to the `messages` table with `sender: 'admin'`. The widget listens for this and displays it to the visitor.

---

### 6. Development Roadmap (12 Weeks)

| **Phase** | **Weeks** | **Focus** |
| --- | --- | --- |
| **Foundation** | 1-2 | Better-auth setup + Supabase DB Schema. |
| **Brain** | 3-5 | n8n "Training" and "Chatting" workflows + Vector DB. |
| **The Widget** | 6-7 | Build the chat bubble and the "Embed Code" generator. |
| **The Inbox** | 8-10 | Real-time chat dashboard, History, and Takeover toggle. |
| **Launch Prep** | 11-12 | Lead notification system (SMS/Email) + Bug Squashing. |

---

### 7. Key "Local Biz" Advantages

- **The "No-Panic" Toggle:** Owners can jump in if the AI gets confused.
- **Zero Learning Curve:** They don't build flows; they just "feed" the bot their website URL.
- **Lead Focus:** Every chat is designed to end with: *"Would you like to book a call via our Calendly or get a 10% discount code?"*