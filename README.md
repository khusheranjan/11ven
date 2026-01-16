# TshirtPrint - Custom T-Shirt Design Platform

A full-stack platform for designing and ordering custom t-shirts.

## Features

- **Design Editor**: fabric.js canvas for placing images, text, and graphics
- **Asset Library**: Admin-managed graphics for users to use in designs
- **User Types**:
  - Type 2 (Low Effort): Browse asset library → add to canvas → buy
  - Type 3 (High Effort): Upload own images + use assets → full editing → buy
- **Checkout**: Size, quantity selection with Razorpay payment
- **Admin Dashboard**: Asset management & order tracking

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + fabric.js
- Backend: Node.js + Express
- Database: MongoDB
- Payments: Razorpay

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas URI

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment
Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tshirtprint
JWT_SECRET=your-secret-key-here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Run development servers
```bash
npm run dev
```
- Client: http://localhost:3000
- Server: http://localhost:5000

## Creating an Admin User

After signing up, manually update user role in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## Project Structure

```
TshirtPrint/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Designer/   # Canvas, Toolbar, AssetLibrary
│   │   │   ├── Admin/      # AssetManager, OrderManager
│   │   │   ├── Auth/       # Login, Signup
│   │   │   └── Layout/     # Navbar
│   │   ├── pages/          # Route pages
│   │   ├── context/        # Auth context
│   │   └── services/       # API calls
├── server/                 # Express backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   └── uploads/            # Uploaded files
```
