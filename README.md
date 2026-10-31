# Event Auction System - Frontend (R2-01)

Live timed event auction web application built with **React**, **TypeScript**, and **Vite**.

## 🚀 Features
- **Real-time Live Bidding**: Transparent bid placement with instant validation.
- **Strict Bid Rejection**: Rejects any bid that does not strictly exceed the highest bid or reserve starting price.
- **Countdown Timer**: Live timer with urgent visual state and automatic bidding closure.
- **Winner Announcement**: Confetti animation and official winner badge upon auction completion.
- **Transparent History**: Chronological log of all bids with participant names, amounts, and leader badges.
- **Organizer Controls**: Reset duration and starting price for rapid testing.
- **Bright Minimal Design**: Curated light theme, sleek typography, smooth micro-interactions.

## 🛠️ Tech Stack
- React 19 + TypeScript
- Vite
- Lucide React
- Canvas Confetti

## 📦 Setup & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🌐 Environment Variables (Optional for Deployment)
When deploying to Vercel/Netlify/Render, add:
```env
VITE_API_URL=https://your-backend-api-url.com
```
*(If unset, it defaults to `/api/auction` for local proxy or same-domain deployment).*
