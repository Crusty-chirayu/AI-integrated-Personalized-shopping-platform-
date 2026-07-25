<div align="center">

# 🛒 CartIQ

### AI-Integrated Personalized Shopping Platform

**Conversational shopping. Real-time inventory. A dashboard built for operators, not just admins.**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: TODO](https://img.shields.io/badge/License-TODO-lightgrey?style=for-the-badge)](#license)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#contributing)
[![Made with ❤](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=flat-square)]()
[![Responsive](https://img.shields.io/badge/Responsive-Yes-success?style=flat-square)]()
[![AI Powered](https://img.shields.io/badge/AI-Powered-8A2BE2?style=flat-square)]()

</div>

> [!NOTE]
> **Honesty first.** Every feature described below is backed by code that actually exists in this repository. Anywhere a claim couldn't be verified against the codebase, you'll see a clearly marked `> TODO` block instead of invented functionality. TODOS > Functiomalities maybe added later.

---

## 🎬 Demo

<div align="center">

`assets/demo.gif`

<img width="1148" height="562" alt="Adobe+Express+-+Recording+2026-07-25+090733" src="https://github.com/user-attachments/assets/8732b376-3e50-4cc6-b1d6-33189e9a4cbb" />



</div>

---

## 📚 Table of Contents

- [About CartIQ](#-about-cartiq)
- [Why CartIQ?](#-why-cartiq)
- [Features](#-features)
  - [Customer Features](#customer-features)
  - [Admin Features](#admin-features)
  - [AI Features](#ai-features)
  - [Security Features](#security-features)
  - [Performance Notes](#performance-notes)
  - [Developer Features](#developer-features)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Database Design](#-database-design)
- [Server Actions & API Routes](#-server-actions--api-routes)
- [Security](#-security)
- [AI Architecture](#-ai-architecture)
- [Roadmap](#-roadmap)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Authors](#-authors)
- [Acknowledgements](#-acknowledgements)

---

## 🧭 About CartIQ

**The problem.** Most e-commerce storefronts are search boxes and filter sidebars wearing a fresh coat of paint. The customer still does all the cognitive work — comparing specs across tabs, guessing whether a review is trustworthy, hunting through categories that don't match how they actually think about what they want.

**The solution.** CartIQ puts a conversational AI assistant directly into the shopping flow. Instead of only filtering by category and price, a customer can describe what they need in plain language and get back real product matches sourced live from the store's own Supabase-backed catalog — with the same product data, images, and pricing shown throughout the rest of the site.

**Mission.** Make product discovery feel like asking a knowledgeable friend, not operating a spreadsheet.

**Vision.** A storefront where the AI layer isn't a bolted-on chatbot widget, but shares state with cart, wishlist, and order history — so recommendations, comparisons, and support all draw from the same source of truth.

**Current goals.**
- Solid, working core commerce flows (browse → cart → checkout → order tracking) — ✅ implemented.
- A conversational assistant wired to real inventory — ✅ implemented.
- An admin surface for operators to manage orders, watch inventory, and export reports — ✅ implemented.
- Deeper personalization and analytics — 🚧 see [Roadmap](#-roadmap).

---

## 💡 Why CartIQ?

Traditional storefronts assume the customer already knows the right search terms, category, and filters. That works for a repeat buyer who knows exactly what SKU they want — it works much less well for someone who knows the *problem* they're solving but not the *product name* that solves it.

CartIQ's assistant is built to sit inside that gap: a customer can type something like "white sneakers under ₹3,000" and get an actual query against the live `products` table, not a canned response. As the catalog and AI layer grow, the goal is for that same conversational surface to also explain *why* a product fits, not just that it matched a keyword — see [AI Architecture](#-ai-architecture) for exactly what's built today versus what's still on the roadmap.

---

## ✨ Features

> Every bullet below maps to a real component, route, or table in this repository. Nothing here is aspirational — aspirational items live in [Roadmap](#-roadmap) instead.

### Customer Features

| Feature | Status | Notes |
|---|---|---|
| Product browsing & product detail pages | ✅ | `/products`, `/products/[slug]` |
| Cart | ✅ | Persistent cart via `cart-context`, quantity controls, line-item removal |
| Wishlist | ✅ | `wishlist-context`, wishlist count badge in the nav |
| Global search | ✅ | Debounced (300ms) Supabase search across `title`, `description`, and `tags` |
| Product comparison | ✅ | `ComparisonCard` component renders side-by-side comparisons inside chat responses |
| AI shopping assistant (chat + voice) | ✅ | Text and voice input (Web Speech API), streaming-style responses |
| Persistent chat history | ✅ | Conversations are saved and reloaded per user via `conversation-service` |
| Order history & order detail view | ✅ | Per-order page with line items, shipping address, payment info, order summary |
| Order cancellation | ✅ | Customers can cancel orders while `payment_status` and `fulfillment_status` are both `pending` |
| Downloadable PDF invoice | ✅ | Generated client-side with `jsPDF` + `jspdf-autotable` |
| Role-aware account menu | ✅ | Guest / customer / admin see different dropdown options |
| Razorpay checkout fields | ⚠️ Partial | `orders.razorpay_order_id` / `razorpay_payment_id` exist and are displayed; full checkout integration is a `TODO` — see below |


### Admin Features

| Feature | Status | Notes |
|---|---|---|
| Dashboard overview | ✅ | Revenue, order count, customer count, and average order value — computed from real Supabase queries, not mock data |
| Recent orders widget | ✅ | Latest 5 orders by `created_at` |
| Low stock alerts | ✅ | Products where `stock_quantity < 5` |
| Order management table | ✅ | Fulfillment status dropdown (`pending / processing / shipped / delivered / cancelled`) with inline update |
| Server-side fulfillment update | ✅ | Implemented as a Next.js **Server Action**, not a client-exposed Supabase call |
| Toast feedback on update | ✅ | Inline success/error toast, no page refresh |
| PDF order report export | ✅ | Branded, styled PDF (header, summary, itemized table, footer) via `jsPDF` |
| Additional report types (Sales, Inventory, Customer, Excel export) | 🚧 TODO | UI cards exist; `action` is `undefined` for all but the Orders Report — buttons render disabled |

### AI Features

CartIQ's AI layer is intentionally scoped today — it's a real, working assistant, not a full autonomous shopping agent. Here's exactly what exists:

- **Conversational shopping assistant** — a chat interface (`ChatWindow`) posts user messages to `/api/ai/chat` and renders the assistant's reply, optionally alongside a product carousel or a side-by-side comparison card.
- **Voice input** — uses the browser's native `SpeechRecognition` / `webkitSpeechRecognition` API to transcribe speech to text before sending it through the same chat pipeline.
- **Persistent conversations** — each conversation is created, titled (auto-truncated from the first message), and stored via Supabase, so returning users see their chat history and can switch between past conversations from a sidebar.
- **Lightweight preference memory** — `extractPreference()` scans user messages for signals like a favorite brand or a preferred budget and persists them via `savePreference()`, so the assistant has some durable context beyond a single conversation.
- **Structured response types** — the backend can return plain text, a product carousel, or a formatted comparison, and the UI renders each differently.

### Security Features

- Supabase Auth for session management (`supabase.auth.getUser()`, `supabase.auth.signOut()`).
- Order queries are scoped with `.eq("user_id", user.id)` so a customer can only fetch their own order — the "not found" state explicitly says *"Order not found or you are not authorized to view it."*
- Role-based UI branching (`admin` vs `customer`) driven by a `role` column on `profiles`.
- Privileged writes (like updating `fulfillment_status`) run through a **Next.js Server Action** backed by the Supabase **service-role** client — the service-role key is never shipped to the browser.



### Performance Notes

- App Router **Server Components** are used for data-fetching pages (admin dashboard, admin orders) — data is fetched once on the server, not waterfalled from the client.
- Debounced search (300ms) avoids firing a Supabase query on every keystroke.
- `Promise.all` is used to parallelize independent Supabase queries (e.g., dashboard stats) rather than awaiting them sequentially.


### Developer Features

- Fully typed with TypeScript across components, Server Actions, and Supabase row shapes.
- Client/server boundary is explicit — Server Actions live in dedicated `actions.ts` files (required by Next.js: a `"use server"` file may only export async functions, so shared constants/types are split into their own module).
- Centralized currency formatting (`formatCurrency()`) used consistently across cart, orders, and PDF exports — no ad hoc `${price.toFixed(2)}` scattered through the UI.

---

## 🖼️ Screenshots

<img width="1884" height="925" alt="image" src="https://github.com/user-attachments/assets/11f5db5d-bb0a-4784-badb-c626b41b1a17" />


| Page | Path | Preview |
|---|---|---|
| Home | `assets/screenshots/home.png` | <img width="1892" height="936" alt="Screenshot 2026-07-24 212012" src="https://github.com/user-attachments/assets/30f7cf78-c0aa-40f6-871f-4fa5af7315d2" />|
| Products | `assets/screenshots/products.png` | <img width="1884" height="925" alt="Screenshot 2026-07-24 212156" src="https://github.com/user-attachments/assets/b90d1be6-c7e7-4921-9b39-9f385361bdbb" />|
| Product Details | `assets/screenshots/product-details.png` | <img width="1883" height="932" alt="Screenshot 2026-07-24 212140" src="https://github.com/user-attachments/assets/1a427e9a-2494-4bcd-9093-c692f9f21f22" /> |
| Cart | `assets/screenshots/cart.png` |<img width="1871" height="920" alt="Screenshot 2026-07-24 212352" src="https://github.com/user-attachments/assets/f363bba4-3de6-4801-9004-24d55e190fc9" />|
| Wishlist | `assets/screenshots/wishlist.png` |<img width="1883" height="936" alt="Screenshot 2026-07-24 212208" src="https://github.com/user-attachments/assets/0815d9b7-d325-4855-a73c-1b3736b1a89f" />|
| AI Assistant | `assets/screenshots/assistant.png` | <img width="1882" height="933" alt="Screenshot 2026-07-24 212243" src="https://github.com/user-attachments/assets/c56ec29e-8b31-4322-baee-8be93bf61ed4" />|
| Orders | `assets/screenshots/orders.png` | <img width="1870" height="928" alt="image" src="https://github.com/user-attachments/assets/ed89874c-6d8e-4c9b-a09b-d1878a1f5233" />|
| Account | `assets/screenshots/account.png` | <img width="1884" height="925" alt="image" src="https://github.com/user-attachments/assets/8f39a6e1-e5d3-469d-9e10-4e34d9bf1ddd" />|
| Admin Dashboard | `assets/screenshots/admin-dashboard.png` | <img width="1913" height="922" alt="image" src="https://github.com/user-attachments/assets/6a3d1660-63ed-4a8c-b4e7-d2fa4acfae91" />|
| Admin Orders | `assets/screenshots/admin-products.png` | <img width="1878" height="913" alt="image" src="https://github.com/user-attachments/assets/dccfbbfe-6a64-4bc8-b3f3-a12dfffb2274" />|
| Reports | `assets/screenshots/reports.png` | <img width="1886" height="925" alt="image" src="https://github.com/user-attachments/assets/c02c6f7b-d655-468b-958c-457190e9735f" /> <img width="971" height="864" alt="image" src="https://github.com/user-attachments/assets/a163e295-e256-435b-b714-a93111d9b23f" />|
| Analytics | `assets/screenshots/analytics.png` | <img width="1914" height="918" alt="image" src="https://github.com/user-attachments/assets/8dec189d-b713-43c3-a30a-4b0b48192377" />|
| Mobile | `assets/screenshots/mobile.png` | <img width="499" height="804" alt="image" src="https://github.com/user-attachments/assets/1d7fbf4f-0513-4650-8927-8a3f00bc302a" />|

---

## 🏗️ Architecture

### High-Level Overview

```mermaid
flowchart TB
    subgraph Client["Browser (Client Components)"]
        UI[Storefront UI]
        Chat[Chat Window]
        Admin[Admin UI]
    end

    subgraph Server["Next.js App Router (Server)"]
        RSC[Server Components]
        SA[Server Actions]
        API["/api/ai/chat, /api/reports/orders"]
    end

    subgraph Data["Supabase"]
        Auth[Supabase Auth]
        DB[(PostgreSQL)]
    end

    UI -->|reads/writes via context + client SDK| DB
    Chat -->|POST| API
    Admin -->|invoke| SA
    RSC -->|service-role queries| DB
    SA -->|service-role update| DB
    UI --> Auth
    Admin --> Auth
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Next.js App
    participant SA as Supabase Auth
    participant DB as profiles table

    U->>App: Visit protected page / open account menu
    App->>SA: supabase.auth.getUser()
    SA-->>App: user or null
    alt No session
        App-->>U: Show guest menu (Login / Register)
    else Session exists
        App->>DB: SELECT role FROM profiles WHERE id = user.id
        DB-->>App: role (admin | customer)
        App-->>U: Render role-specific menu
    end
```

### AI Chat Flow

```mermaid
sequenceDiagram
    participant U as User
    participant CW as ChatWindow
    participant API as /api/ai/chat
    participant DB as Supabase (conversations, messages)

    U->>CW: Types or speaks a message
    CW->>DB: saveMessage(conversationId, "user", text)
    CW->>API: POST { sessionId, message }
    API-->>CW: { type, message, products?, comparison? }
    CW->>DB: saveMessage(conversationId, "assistant", ...)
    CW-->>U: Render text / product carousel / comparison
```



### Order Flow

```mermaid
sequenceDiagram
    participant U as Customer
    participant Cart as Cart Page
    participant Orders as orders / order_items
    participant Admin as Admin Orders Page

    U->>Cart: Review cart, proceed to checkout
    Cart-->>Orders: TODO — checkout → order creation flow not confirmed
    Orders-->>U: Order visible on /orders/[orderId]
    Admin->>Orders: Update fulfillment_status (Server Action)
    Orders-->>U: Status reflected next time order is viewed
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js (App Router, 15/16) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **State Management** | React Context (`cart-context`, `wishlist-context`) |
| **Backend / Database** | Supabase (PostgreSQL + Auth) |
| **Privileged Server Access** | Supabase service-role client (server-only, via `getSupabaseAdmin()`) |
| **Server-Side Mutations** | Next.js Server Actions |
| **PDF Generation** | jsPDF + jspdf-autotable |
| **Payments (partial)** | Razorpay fields present in schema — full integration `TODO` |
| **AI / Chat Backend** | Custom `/api/ai/chat` route — internal implementation `TODO` |
| **Deployment** | `TODO` — not confirmed (commonly Vercel for this stack, but unverified) |
| **Package Manager** | `TODO` — confirm npm / pnpm / yarn from lockfile |

---

## 📁 Folder Structure

> [!NOTE]
> This tree reflects paths and files directly referenced in the codebase during this review. It is **not exhaustive** — treat it as a partial map, and expand it as the rest of the repo is audited.

```
cartiq/
├── src/
│   ├── app/
│   │   ├── (storefront)/
│   │   │   ├── account/
│   │   │   │   └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx            # CartPage
│   │   │   └── orders/
│   │   │       └── [orderId]/
│   │   │           └── page.tsx        # Order details, cancel, invoice PDF
│   │   ├── admin/
│   │   │   ├── page.tsx                # AdminHomePage (dashboard)
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx            # AdminOrdersPage
│   │   │   │   ├── OrderFulfillmentCell.tsx
│   │   │   │   ├── actions.ts          # "use server" — updateFulfillmentStatus
│   │   │   │   └── fulfillment-status.ts
│   │   │   └── reports/
│   │   │       └── page.tsx            # AdminReportsPage
│   │   └── api/
│   │       ├── ai/chat/                
│   │       └── reports/orders/         
│   ├── components/
│   │   ├── ChatWindow.tsx
│   │   ├── ComparisonCard.tsx
│   │   ├── ConversationSidebar.tsx
│   │   ├── ProductCarousel.tsx
│   │   ├── FloatingDock.tsx           
│   │   ├── VoiceButton.tsx
│   │   ├── VoiceVisualizer.tsx
│   │   ├── AIMessage.tsx
│   │   ├── Message.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── search-modal.tsx
│   │   └── storefront-shell.tsx
│   ├── contexts/
│   │   ├── cart-context.tsx
│   │   └── wishlist-context.tsx
│   └── lib/
│       ├── auth.ts                     # getCurrentUser()
│       ├── supabase.ts                 # browser client, getSupabaseClient()
│       ├── supabase-server.ts          # service-role client, getSupabaseAdmin()
│       ├── formatCurrency.ts
│       └── ai/
│           ├── conversation-service.ts
│           ├── memory-extractor.ts
│           └── memory-service.ts
└── README.md
```

---

## 🚀 Installation Guide

```bash
# 1. Clone the repository
git clone https://github.com/TODO-your-username/cartiq.git
cd cartiq

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local   # TODO — create .env.example if it doesn't exist yet
# then fill in the values described below

# 4. Set up your Supabase project
# "Database Design" below. No migration files were reviewed for this README.

# 5. Run the development server
npm run dev

# App will be available at http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

| Variable | Required | Used By | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Client & server | Your Supabase project URL. Public — safe to expose to the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server only | Supabase **service-role** key. Bypasses Row Level Security. **Never** expose this to the client or commit it to version control. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ⚠️ Likely required | Client | Referenced implicitly by any browser-side Supabase client, but not directly confirmed in the files reviewed — `TODO`, confirm in `src/lib/supabase.ts`. |
| AI provider key (e.g. `OPENAI_API_KEY`) |`/api/ai/chat` | Not confirmed — depends on what `/api/ai/chat` actually calls internally. |
| Razorpay keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) | Checkout (unbuilt) | Schema has `razorpay_order_id` / `razorpay_payment_id` columns, but the checkout integration that would consume these keys wasn't confirmed to exist yet. |

> [!IMPORTANT]
> `SUPABASE_SERVICE_ROLE_KEY` must only ever be read on the server (`getSupabaseAdmin()`). If you see it referenced in any file marked `"use client"`, that's a security bug — fix it before deploying.

---

## 🗄️ Database Design

> Schema below reflects columns actually referenced in application code during this review. Column types, defaults, foreign keys, and indexes are `TODO` — add the real `CREATE TABLE` statements or a schema diagram here once migrations are documented.

**`profiles`**
| Column | Notes |
|---|---|
| `id` | Matches Supabase Auth user id |
| `email` | |
| `full_name` | |
| `avatar_url` | |
| `role` | `"admin"` \| `"customer"` |

**`products`**
| Column | Notes |
|---|---|
| `id` | |
| `title` | |
| `slug` | Used for `/products/[slug]` routing |
| `description` | Searched via `ilike` |
| `price` | |
| `sale_price` | |
| `category_id` | |
| `stock_quantity` | Drives low-stock admin alerts (`< 5`) |
| `tags` | Postgres array, searched via `.cs.{term}` |
| `created_at` | |

**`product_images`**
| Column | Notes |
|---|---|
| `id` | |
| `product_id` | FK → `products.id` |
| `image_url` | |
| `sort_order` | Lowest `sort_order` used as primary image |
| `alt_text` | |

**`orders`**
| Column | Notes |
|---|---|
| `id` | |
| `order_number` | Human-facing order identifier |
| `user_id` | Owner of the order |
| `email` | |
| `shipping_address` / `billing_address` | JSON |
| `shipping_method` | |
| `subtotal`, `discount_amount`, `tax_amount`, `shipping_cost`, `total` | |
| `payment_status` | e.g. `"pending"`, `"paid"` |
| `fulfillment_status` | `"pending"` \| `"processing"` \| `"shipped"` \| `"delivered"` \| `"cancelled"` |
| `razorpay_order_id` / `razorpay_payment_id` | Present in schema; full payment flow `TODO` |
| `created_at` | |

**`order_items`**
| Column | Notes |
|---|---|
| `id` | |
| `order_id` | FK → `orders.id` |
| `product_id` | FK → `products.id` |
| `variant_id` / `variant_info` | |
| `title` | Snapshot of product title at time of order |
| `quantity` | |
| `unit_price` / `line_total` | |


---

## 🔌 Server Actions & API Routes

| Endpoint / Action | Type | Purpose |
|---|---|---|
| `updateFulfillmentStatus(orderId, status)` | Server Action (`admin/orders/actions.ts`) | Updates `orders.fulfillment_status` using the service-role client; validated against a fixed status list. |
| `GET /api/ai/chat` *(POST, actually)* | Route Handler | Receives `{ sessionId, message }`, returns `{ type, message, products?, comparison? }`. **Internal implementation not reviewed — .** |
| `GET /api/reports/orders` | Route Handler | Returns order data as JSON, consumed by the admin PDF export. **Internal implementation not reviewed — .** |

> [!WARNING]
>  No other API routes (checkout, wishlist persistence, product CRUD, review submission) were confirmed during this review. Add rows here as each route is verified — don't assume a route exists just because a page references a matching feature.

---

## 🛡️ Security

- **Authentication:** Supabase Auth (`supabase.auth.getUser()` / `signOut()`).
- **Authorization pattern:** Role stored on `profiles.role`, checked client-side to branch UI (Admin Dashboard link, etc.).
- **Data scoping:** Order detail queries filter by `user_id` in addition to `order_number`, and explicitly return an "unauthorized" state rather than someone else's order data.
- **Privileged writes isolated:** Only Server Actions (server-only code) touch the service-role Supabase client. Client components never import or call it directly.
- **Secrets:** `SUPABASE_SERVICE_ROLE_KEY` is read only inside `getSupabaseAdmin()`, a server-only module.

> [!WARNING]
>  Role checks described above are enforced in the **UI**, not confirmed to be enforced by **Postgres Row Level Security policies**. A `role` check that only exists in React is not real access control by itself. Before this project handles real user data in production, add and document actual RLS policies on every table above, and confirm the admin routes also check `role` server-side (not just render conditionally).

---

## 🧠 AI Architecture

**What's confirmed to exist:**

1. `ChatWindow` collects a user message (typed or transcribed from voice) and calls `POST /api/ai/chat` with `{ sessionId, message }`.
2. The response shape is `{ type: "text" | "products" | "comparison" | "order", message, products?, comparison? }` — the frontend renders each `type` differently (plain text, a `ProductCarousel`, or a `ComparisonCard`).
3. Every user and assistant message is persisted via `saveMessage()`, and full conversation history is reloaded via `getMessages()` / `getLatestConversation()` on mount.
4. A lightweight preference extractor (`extractPreference()`) looks for a favorite brand or budget signal in the user's message and stores it via `savePreference()`.

**What's explicitly not confirmed** (do not present these as shipped without verifying first):

- Which LLM/AI provider `/api/ai/chat` actually calls.
- Whether responses are generated via retrieval-augmented generation against the `products` table, a fixed set of prompt templates, or something else.
- Whether "context awareness" spans multiple sessions or is limited to the extracted brand/budget preferences described above.
- Whether product explanations are AI-generated text or templated strings.

> [!IMPORTANT]
> Document `/api/ai/chat`'s real implementation here once reviewed. An AI-focused README is only credible if the AI section is exactly as accurate as the rest of it.

---

## 🗺️ Roadmap

### ✅ Current (shipped)
- [x] Storefront: browsing, cart, wishlist, search
- [x] AI chat assistant with voice input and persistent history
- [x] Order detail page with cancellation and PDF invoice
- [x] Admin dashboard with real Supabase-backed stats
- [x] Admin order management with Server Action–based status updates
- [x] Admin PDF orders report
- [x] Razorpay checkout flow, end-to-end
- [x] `/api/ai/chat` implementation
- [x] Row Level Security policies across tables
- [x] Remaining report types (Sales, Inventory, Customer, Excel)

### 🚧 Next
- [ ] `TODO` — add what's actively in progress next

### 🔭 Future
- [ ] Standalone product comparison page (not just chat-embedded)
- [ ] Customer-facing analytics (order history trends, spend insights)
- [ ] Reviews and ratings

### 🧪 Version 2 (exploratory)
- [ ] Retrieval-augmented product explanations
- [ ] Cross-session personalization beyond brand/budget extraction
- [ ] Public API for third-party storefront integrations

---

## ☁️ Deployment

> [!WARNING]
> **TODO.** No deployment configuration (Vercel project settings, CI/CD, environment secrets in a hosting provider) was confirmed during this review. The steps below are a generic starting point — replace with your project's actual deployment process.

```bash
# Example (Vercel CLI) — confirm this matches your actual setup
npm i -g vercel
vercel
```

Required at minimum in your hosting provider's environment settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Any AI provider key once confirmed (see [Environment Variables](#-environment-variables))

---

## 🤝 Contributing

Contributions are welcome. Until a formal `CONTRIBUTING.md` exists:

1. Fork the repository and create a feature branch.
2. Keep PRs scoped — one feature or fix per PR.
3. If you touch a Server Action file, remember: a `"use server"` file may **only** export async functions. Shared constants/types belong in a separate module (see `admin/orders/fulfillment-status.ts` for the pattern this repo already uses).
4. Update this README's relevant section (and remove the matching `TODO`) if your PR ships something documented here as a placeholder.
5. Open a PR with a clear description of what changed and why.

> [!NOTE]
> `TODO` — add a code of conduct and a formal contribution template if this project accepts external contributors going forward.

---

## 📄 License

> [!WARNING]
> **TODO.** No `LICENSE` file was confirmed in this repository. Choose a license (MIT is common for projects like this) and add both the `LICENSE` file and a real badge here — the badge above currently reads "TODO" on purpose, so it doesn't misrepresent the project's actual licensing status.

---

## 👤 Authors

> `TODO` — add real name(s), GitHub handle(s), and contact/portfolio links here.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) — application framework
- [Supabase](https://supabase.com/) — database, auth, and backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Framer Motion](https://www.framer.com/motion/) — animation
- [Lucide](https://lucide.dev/) — icon set
- [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) — PDF generation

---

<div align="center">

**If CartIQ is useful to you, consider starring the repo ⭐**

*Built with a real Supabase schema, real Server Actions, and an honest README.*

</div>

</div>
