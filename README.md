# Diwai Fox Taxi Service 🚕

A full-stack web application for taxi booking service with separate interfaces for passengers, drivers, and administrators.

## 🌟 Features

- **Passenger Interface**: Book rides, track drivers, view ride history
- **Driver Dashboard**: Accept rides, manage trips, track earnings
- **Admin Panel**: Manage users, monitor rides, view analytics and payments
- **Real-time fare calculation** based on distance and vehicle type
- **Secure authentication** with JWT and role-based access control

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Lucide React Icons

**Backend:**
- Node.js
- Express.js
- JWT Authentication
- bcrypt for password hashing

**Deployment:**
- Frontend: Netlify
- Backend: Render.com
- Version Control: GitHub

## 🚀 Live Demo

**Live Site:** [https://diwai-fox-taxi-service.netlify.app](https://diwai-fox-taxi-service.netlify.app)

**Test Accounts:**
- Admin: `admin@diwaifox.com` / `admin123`
- Passenger: 'jz@gmail.com' / 'joanzebedee'
- Driver: 'testdriver@gmail.com' / 'testdriver123'
- Or register your own account as Passenger or Driver

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📝 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/rides` - Get rides (filtered by role)
- `POST /api/rides` - Book new ride
- `PUT /api/rides/:id/accept` - Driver accepts ride
- `GET /api/admin/stats` - Admin dashboard statistics

## 📄 License

© 2025 Diwai Fox Taxi Service

## 👨‍💻 Developer

Developed by [Your Name]
