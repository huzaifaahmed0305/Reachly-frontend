# Reachly Frontend

React + Vite frontend for Reachly — the influencer booking platform for Pakistan.

## Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Home / Landing | Public |
| `/explore` | Browse all creators | Public |
| `/creator/:handle` | Influencer profile + booking | Public |
| `/book/:handle` | Full booking flow | Login required |
| `/dashboard` | Creator earnings dashboard | Influencer only |
| `/my-bookings` | Follower's bookings list | Follower only |
| `/login` | Sign in | Public |
| `/register` | Create account | Public |

## Quick Start

### 1. Install dependencies
```bash
cd reachly-frontend
npm install
```

### 2. Create .env file
```bash
cp .env.example .env
```
The default value `VITE_API_URL=http://localhost:3000/api` works if your backend is running locally.

### 3. Make sure your backend is running
```bash
# In your reachly backend folder:
npm run dev
# Should say: Reachly API running on http://localhost:3000
```

### 4. Start the frontend
```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Router + route protection
├── index.css             # Global styles + CSS variables
├── context/
│   └── AuthContext.jsx   # Auth state (login, register, logout)
├── lib/
│   └── api.js            # Axios client with JWT auto-attach
├── components/
│   └── layout/
│       └── Navbar.jsx    # Sticky navbar with user menu
└── pages/
    ├── Home.jsx          # Landing page
    ├── Login.jsx         # Sign in form
    ├── Register.jsx      # Sign up (influencer or follower)
    ├── Explore.jsx       # Search & browse creators
    ├── InfluencerProfile.jsx  # Creator page + session picker
    ├── BookingFlow.jsx   # 3-step booking (date → details → pay)
    ├── Dashboard.jsx     # Influencer earnings & sessions
    └── MyBookings.jsx    # Follower bookings list
```

## Build for Production

```bash
npm run build
# Output goes to /dist — deploy to Vercel, Netlify, or any static host
```

## Deploy to Vercel (free)

```bash
npm install -g vercel
vercel
```

Set environment variable in Vercel dashboard:
```
VITE_API_URL=https://your-backend.railway.app/api
```
