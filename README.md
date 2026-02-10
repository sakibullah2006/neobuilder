# 🤖 NeoBuilder: Lead-First Chatbot Builder

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![n8n](https://img.shields.io/badge/n8n-Automation-orange?style=flat-square&logo=n8n)](https://n8n.io)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

> **NeoBuilder** is a "Lead-First" chatbot builder for local businesses. Automate customer support and lead capture with the ability to intervene in high-stakes conversations.

## 📋 Table of Contents

- [Features](#-key-features)
- [Tech Stack](#-the-tech-stack)
- [Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Core Features](#-core-feature-modules)
- [Roadmap](#-development-roadmap-12-weeks)
- [Getting Started](#-getting-started)
- [Contributing](#-contributing)

---

## 🎯 Key Features

✅ **The "No-Panic" Toggle** — Owners can jump in if the AI gets confused  
✅ **Zero Learning Curve** — Just feed the bot your website URL  
✅ **Lead Focus** — Every chat ends with a Calendly booking or discount code  
✅ **Real-time Dashboard** — Live chat monitoring and human takeover  
✅ **Vector-based Memory** — AI remembers context with pgvector embeddings  
✅ **Multi-tenant Ready** — Support multiple chatbots and users  

---

## 📘 Software Requirements Specification (SRS)

### 1. Product Vision

NeoBuilder is a "Lead-First" chatbot builder. It targets local businesses that need to automate customer support and lead capture but want the ability to intervene in high-stakes conversations.

### 🛠 The Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui.
- **Authentication:** **Better-auth** (integrated with your Postgres DB).
- **Logic & Automation:** **n8n** (Self-hosted via Docker).
- **Database:** Supabase/PostgreSQL (with **pgvector** enabled for AI memory).
- **Chat Widget:** Custom Preact/React component (embedded via `<script>`).

---

### 🏗 System Architecture

The system operates on a "Triad" model: the **Portal** handles management, **n8n** handles the brain, and the **Widget** handles the interaction.

---

### 🗄 Database Schema

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

---

## 🧠 Core Feature Modules

### A. The "Easy Feed" Knowledge Engine

- **Input:** User pastes a URL or uploads a PDF in the Dashboard.
- **n8n Workflow:** 
  1. Receive Webhook from Next.js.
  2. Scrape/Parse content.
  3. Chunk text into segments.
  4. Generate Embeddings (OpenAI).
  5. Save to `bot_knowledge` with the associated `bot_id`.

### B. The Hybrid Chat Logic (n8n)

This is the core "Switch" that allows for human takeover.

1. **Incoming Message:** Received via Webhook.
2. **Check Status:** n8n queries the `conversations` table for `is_human_controlled`.
3. **Route A (False):** n8n performs a vector search on the knowledge base → Sends context to LLM → Sends AI reply to widget.
4. **Route B (True):** n8n stops execution. The visitor's message is saved to the DB, and the Admin is notified to reply manually.

### C. Live Takeover Dashboard

- **Real-time Feed:** Using Supabase Realtime, the admin sees messages appear as they happen.
- **The Switch:** Clicking "Take Control" sends an API call to set `is_human_controlled = true`.
- **Live Reply:** Admin types in a text box; the message is saved to the `messages` table with `sender: 'admin'`. The widget listens for this and displays it to the visitor.

---

## 📅 Development Roadmap (12 Weeks)

| **Phase** | **Weeks** | **Focus** |
| --- | --- | --- |
| **Foundation** | 1-2 | Better-auth setup + Supabase DB Schema. |
| **Brain** | 3-5 | n8n "Training" and "Chatting" workflows + Vector DB. |
| **The Widget** | 6-7 | Build the chat bubble and the "Embed Code" generator. |
| **The Inbox** | 8-10 | Real-time chat dashboard, History, and Takeover toggle. |
| **Launch Prep** | 11-12 | Lead notification system (SMS/Email) + Bug Squashing. |

---

## 🚀 Local Business Advantages

- **The "No-Panic" Toggle:** Owners can jump in if the AI gets confused.
- **Zero Learning Curve:** They don't build flows; they just "feed" the bot their website URL.
- **Lead Focus:** Every chat is designed to end with: *"Would you like to book a call via our Calendly or get a 10% discount code?"*

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 15+ with pgvector extension
- Supabase account (or self-hosted Postgres)
- n8n instance (Docker recommended)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neobuilder.git
   cd neobuilder
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your:
   - Supabase connection string
   - Better-auth settings
   - n8n webhook URLs
   - OpenAI API key

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📦 Project Structure

```
neobuilder/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   ├── widgets/         # Chat widget code
│   └── db/              # Database schemas & clients
├── public/              # Static assets
├── components.json      # shadcn/ui config
├── tsconfig.json        # TypeScript config
├── next.config.ts       # Next.js config
└── README.md
```

---

## 🔗 Related Resources

- **[Better-auth Documentation](https://better-auth.com)** — Authentication setup
- **[n8n Documentation](https://docs.n8n.io)** — Workflow automation
- **[Supabase Docs](https://supabase.com/docs)** — PostgreSQL + pgvector
- **[OpenAI API Reference](https://platform.openai.com/docs)** — LLM integration
- **[Next.js Documentation](https://nextjs.org/docs)** — Full-stack framework
- **[Tailwind CSS](https://tailwindcss.com/docs)** — Styling framework
- **[shadcn/ui](https://ui.shadcn.com)** — Component library

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use TypeScript for type safety

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Sakib** — Initial concept and development

---

## 💬 Support & Feedback

Have questions or feedback? Open an [issue](https://github.com/yourusername/neobuilder/issues) or start a [discussion](https://github.com/yourusername/neobuilder/discussions).

---

**Built with ❤️ for local businesses**
