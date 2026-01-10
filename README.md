# Lumia AI
### Conversations that feel human, not robotic

Lumia AI is a premium conversational AI platform that transforms how you interact with artificial intelligence. Built with obsessive attention to detail, it combines cutting-edge AI models with a meticulously crafted interface that feels calm, expensive, and emotionally human.

[ Website ] • [ Documentation ] • [ Discord ] • [ GitHub ]

---

## Product Vision

Most AI chat interfaces feel cold and transactional. They're functional but forgettable—designed like tools, not experiences. Lumia AI exists because conversations should feel like conversations, not interrogations.

We're building the first AI platform where:
- **Emotional intelligence** meets technical excellence
- **Human warmth** replaces robotic efficiency
- **Beautiful design** amplifies powerful capabilities
- **Privacy-first** architecture respects user autonomy

Every pixel, every animation, every interaction is crafted to make AI feel less like software and more like talking to a brilliant friend who happens to be powered by neural networks.

---

## Core Capabilities

### 🤖 Smart Models
Multi-model architecture supporting Anthropic Claude, OpenAI GPT-4, Google Gemini, DeepSeek, and more. Switch between models instantly based on your needs.

### 🎨 Customization Engine
Shape your AI's personality with traits (Bold, Witty, Honest, Encouraging), occupation settings, and capability toggles. Make Lumia feel uniquely yours.

### 🔍 Web Search Integration
Real-time web search with intelligent result parsing. Get current information, images, and videos directly in your conversations.

### 💻 Code Generation
Syntax-highlighted code blocks with copy-to-clipboard, support for multiple languages, and intelligent code completion.

### 🖼️ Image Generation
DALL-E integration for creative image generation with style presets and customizable prompts.

### 📄 Document Processing
Upload and analyze files. Process documents, spreadsheets, and images with context-aware understanding.

### 🔐 Enterprise Security
Two-factor authentication, email verification, encrypted data storage, and granular privacy controls.

### 📊 Advanced Analytics
Real-time chat analytics, token usage tracking, and performance insights.

---

## Why Lumia AI?

### 🎯 **Human-Centered Design**
Unlike interfaces built for machines, Lumia is designed for humans. Every interaction—from typing animations to hover states—is crafted to feel natural and delightful.

### ⚡ **Performance-First**
GPU-accelerated animations, lazy-loaded components, and edge caching ensure the interface feels instantaneous, even during complex operations.

### 🔒 **Privacy-Native**
Your conversations are yours. End-to-end encryption, local-first architecture, and transparent data handling built into the foundation.

### 🧩 **Modular Architecture**
Built with Next.js App Router, React Server Components, and TypeScript. Clean separation of concerns makes it easy to extend and customize.

### 🎨 **Premium Aesthetics**
Inspired by ChatGPT macOS but elevated. SF Pro typography hierarchy, subtle shadows, warm neutral backgrounds, and micro-interactions that make the interface feel expensive.

### 🤖 **AI-Native**
Every feature is built with AI in mind. Streaming responses, progressive rendering, intelligent context management, and seamless model switching.

---

## UI Preview

### Chat Interface
![Chat Interface](images/1.png)

The heart of Lumia AI—a centered, spacious chat interface with rounded message cards, subtle shadows, and smooth animations. Messages fade in from below with natural easing curves.

### Message Cards
![Message Cards](images/2.png)

Premium message cards with soft shadows, rounded corners (18px radius), and careful typography. User messages align right with subtle gray backgrounds; assistant messages feel spacious and readable.

### Customization Panel
![Customization](images/3.png)

Shape your AI's personality through intuitive controls. Select traits, capabilities, and preferences to make Lumia feel uniquely yours.

### Features Overview
![Features](images/4.png)

Explore Lumia's capabilities with a clean, information-dense interface that doesn't overwhelm. Every feature is discoverable but not intrusive.

---

## Tech Stack

**Frontend:**
- Next.js 15 (App Router, Server Components)
- TypeScript (strict mode)
- React 18 (Concurrent Features)
- Tailwind CSS (utility-first styling)

**UI Components:**
- Radix UI (accessible primitives)
- Framer Motion (smooth animations)
- Lucide Icons (consistent iconography)
- shadcn/ui (component foundation)

**AI & Models:**
- Vercel AI SDK (unified AI interface)
- Anthropic Claude
- OpenAI GPT-4
- Google Gemini
- DeepSeek, Groq, Azure OpenAI

**Backend:**
- Next.js API Routes (Server Actions)
- NextAuth.js v5 (authentication)
- PostgreSQL (via Vercel Postgres)
- Drizzle ORM (type-safe queries)

**Infrastructure:**
- Vercel (hosting & edge functions)
- Vercel Blob (file storage)
- Mailgun (email delivery)
- Stripe (payments)

**Developer Experience:**
- Biome (formatting & linting)
- Playwright (E2E testing)
- TypeScript (type safety)
- SWR (data fetching)

---

## Pages Overview

| Page | Description |
|------|-------------|
| `/` | Main chat interface with welcome screen |
| `/chat/[id]` | Individual conversation threads |
| `/login` | Email/nickname authentication with 2FA |
| `/register` | Account creation with email verification |
| `/settings` | User preferences, security, customization |
| `/payment` | Subscription management and billing |
| `/policy` | Terms of service and privacy policy |

---

## Visual Identity

Lumia AI's design language is built on four pillars:

### **Typography Hierarchy**
SF Pro-inspired system font stack with careful size, weight, and spacing. Headers use -0.01em letter-spacing for a premium feel. Message text sits at 15px with 1.6 line-height for comfortable reading.

### **Color System**
Warm neutral backgrounds (#fafafa light, #171717 dark) with high-contrast text ensure readability without eye strain. Subtle grays for user messages, pure white for assistant responses.

### **Motion & Micro-interactions**
Every animation uses cubic-bezier(0.22, 1, 0.36, 1) easing—the same curve used by premium design systems. Messages fade in from below (250ms duration). Hover states scale to 1.02 with shadow intensification.

### **Capsule UI**
Rounded message cards (18px radius) with soft shadows create depth without heaviness. Input fields use 30px border-radius for a modern, friendly feel.

### **Adaptive Layouts**
Centered chat layout (max-width 768px on desktop, 95% on mobile) with generous vertical padding (4rem) creates breathing room. Empty space is treated as a design element.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Hqzdev/Lumia.git

# Navigate to the project directory
cd Lumia

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your keys

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see Lumia AI in action.

### Environment Variables

Required environment variables (see `env.example` for full list):

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-domain.mailgun.org
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## Roadmap

### **Now**
- ✅ Premium chat interface redesign
- ✅ Multi-model support
- ✅ Two-factor authentication
- ✅ Email verification
- ✅ File uploads and processing
- ✅ Custom AI personality traits

### **Next**
- 🔄 Advanced code editor with syntax highlighting
- 🔄 Real-time collaboration features
- 🔄 API access for developers
- 🔄 Plugin system for extensibility
- 🔄 Mobile app (iOS/Android)

### **Future**
- 🔮 Voice input and output
- 🔮 Video conversation mode
- 🔮 Multi-modal AI (vision + language)
- 🔮 Team workspaces and sharing
- 🔮 Custom model fine-tuning
- 🔮 Marketplace for AI personalities

---

## Built with Obsession

**Lumia AI** is crafted by [Hqz.dev](https://github.com/Hqzdev) with obsessive attention to detail. Every interaction, every animation, every pixel is considered.

Designed for humans who believe technology should feel warm, not cold. Built for conversations that matter.

---

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest features.

---

## Support

- **Documentation:** [docs.lumia.ai](https://docs.lumia.ai)
- **Discord:** [Join our community](https://discord.gg/lumia)
- **Email:** support@lumia.ai
- **GitHub Issues:** [Report bugs](https://github.com/Hqzdev/Lumia/issues)

---

**Made with ❤️ by the Lumia AI team**
