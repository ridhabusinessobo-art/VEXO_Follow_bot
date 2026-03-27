# 🚀 VEXO Follow Bot — SMM Panel

A production-ready Social Media Marketing (SMM) panel with a Telegram bot, REST API backend, and React frontend dashboard.

## Features

- **Telegram Bot** — Browse packages, place orders, check balance and order status
- **REST API** — Express.js backend with JWT auth, rate limiting, helmet security
- **React Dashboard** — MUI-based dark/light theme UI with full order management
- **Admin Panel** — User management, order oversight, deposit approvals, service sync
- **5 Payment Methods** — Credit card, PayPal, Stripe, Crypto, Bank Transfer
- **SMM Integration** — Direct integration with marines70.com API

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Redis (optional, for rate limiting)

### 1. Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

The `server/.env` file is pre-configured. Update the following with your own values:
- `TELEGRAM_BOT_TOKEN` — Get from [@BotFather](https://t.me/BotFather)
- `ADMIN_TELEGRAM_ID` — Your Telegram user ID
- `SMM_API_URL` / `SMM_API_KEY` — Your SMM provider credentials

### 3. Start Services

```bash
# Terminal 1: Start backend + bot
cd server && npm start

# Terminal 2: Start frontend
cd client && npm start
```

### 4. Docker Compose (Recommended)

```bash
docker-compose up -d
```

---

## Project Structure

```
VEXO_Follow_bot/
├── server/
│   ├── src/
│   │   ├── models/          # Mongoose models (User, Order, Transaction, Service)
│   │   ├── routes/          # Express route handlers
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, rate limiting, error handling
│   │   └── config/          # Database & SMM API config
│   ├── bot/
│   │   ├── bot.js           # Main Telegram bot
│   │   └── commands/        # Bot command handlers
│   ├── .env                 # Environment variables
│   └── server.js            # Entry point
├── client/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, OrderCard, PaymentModal
│   │   └── pages/           # Login, Register, Dashboard, Packages, Orders, Wallet, Admin
│   └── public/
├── docker-compose.yml
└── .gitignore
```

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |
| PUT | `/api/auth/profile` | Update profile |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/orders` | List user orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get order detail |
| DELETE | `/api/orders/:id` | Cancel order |
| POST | `/api/orders/:id/sync` | Sync order status from SMM API |

### Payments
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payments/deposit` | Initiate deposit |
| POST | `/api/payments/confirm` | Confirm payment |
| GET | `/api/payments/transactions` | Transaction history |
| GET | `/api/payments/balance` | Wallet balance |

### Services
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/services` | List services |
| GET | `/api/services/:id` | Get service |
| POST | `/api/services/sync` | Sync from SMM API (admin) |

### Admin (requires admin role)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id` | Update user |
| POST | `/api/admin/users/:id/ban` | Ban user |
| GET | `/api/admin/orders` | All orders |
| GET | `/api/admin/transactions` | All transactions |
| POST | `/api/admin/transactions/:id/approve` | Approve deposit |

---

## Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message & main menu |
| `/packages` | Browse SMM packages |
| `/order` | Place a new order (multi-step) |
| `/orders` | Check order status by ID |
| `/balance` | View panel balance |
| `/help` | Help & support info |

---

## Setting Admin Account

1. Register on the web panel at `http://localhost:3000/register`
2. Connect to MongoDB and update your user's role to `admin`:
   ```js
   db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
   ```

---

## Security

- JWT authentication with 7-day expiry
- bcrypt password hashing (12 rounds)
- Helmet.js HTTP security headers
- Rate limiting (200 req/15min general, 20 req/15min auth)
- CORS restricted to client URL
- Input validation with express-validator

SMM Panel and Telegram Bot
