// server.js - Main backend server for Diwai Fox Taxi Service
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (replace with PostgreSQL in production)
const db = {
  users: [],
  rides: [],
  payments: [],
  settings: {
    emailNotifications: true,
    theme: 'gold'
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ============ AUTHENTICATION ROUTES ============

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, role, vehicleType, licensePlate } = req.body;

    // Validate input
    if (!email || !password || !name || !phone || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      phone,
      role, // 'passenger', 'driver', 'admin'
      vehicleType: role === 'driver' ? vehicleType : null,
      licensePlate: role === 'driver' ? licensePlate : null,
      status: role === 'driver' ? 'offline' : 'active',
      earnings: 0,
      rating: 5.0,
      createdAt: new Date().toISOString()
    };

    db.users.push(user);

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { ...user, password: undefined }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: { ...user, password: undefined }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Password reset request
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // In production, send email with reset token
  res.json({ message: 'Password reset email sent' });
});

// ============ RIDE ROUTES ============

// Create a new ride booking
app.post('/api/rides', authenticateToken, (req, res) => {
  try {
    const { pickupLocation, destination, vehicleType, paymentMethod } = req.body;

    if (!pickupLocation || !destination || !vehicleType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate fare (simplified)
    const baseFare = 5;
    const perKmRate = vehicleType === 'sedan' ? 2 : vehicleType === 'suv' ? 3 : 1.5;
    const distance = Math.random() * 20 + 2; // Random distance 2-22km
    const fare = (baseFare + (distance * perKmRate)).toFixed(2);
    const eta = Math.floor(Math.random() * 15) + 5; // 5-20 mins

    const ride = {
      id: uuidv4(),
      passengerId: req.user.id,
      driverId: null,
      pickupLocation,
      destination,
      vehicleType,
      distance: distance.toFixed(2),
      fare: parseFloat(fare),
      eta,
      status: 'pending', // pending, accepted, in-progress, completed, cancelled
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      startTime: null,
      endTime: null
    };

    db.rides.push(ride);

    res.status(201).json({
      message: 'Ride booked successfully',
      ride
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all rides (filtered by user role)
app.get('/api/rides', authenticateToken, (req, res) => {
  try {
    let rides;

    if (req.user.role === 'admin') {
      rides = db.rides;
    } else if (req.user.role === 'driver') {
      rides = db.rides.filter(r => r.driverId === req.user.id || r.status === 'pending');
    } else {
      rides = db.rides.filter(r => r.passengerId === req.user.id);
    }

    // Populate user details
    const ridesWithDetails = rides.map(ride => ({
      ...ride,
      passenger: db.users.find(u => u.id === ride.passengerId),
      driver: ride.driverId ? db.users.find(u => u.id === ride.driverId) : null
    }));

    res.json({ rides: ridesWithDetails });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific ride
app.get('/api/rides/:id', authenticateToken, (req, res) => {
  const ride = db.rides.find(r => r.id === req.params.id);
  
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }

  // Check authorization
  if (req.user.role !== 'admin' && 
      ride.passengerId !== req.user.id && 
      ride.driverId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ ride });
});

// Driver accepts ride
app.put('/api/rides/:id/accept', authenticateToken, (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ error: 'Only drivers can accept rides' });
  }

  const ride = db.rides.find(r => r.id === req.params.id);
  
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }

  if (ride.status !== 'pending') {
    return res.status(400).json({ error: 'Ride is not available' });
  }

  ride.driverId = req.user.id;
  ride.status = 'accepted';
  ride.startTime = new Date().toISOString();

  res.json({ message: 'Ride accepted', ride });
});

// Update ride status
app.put('/api/rides/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const ride = db.rides.find(r => r.id === req.params.id);
  
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }

  // Authorization check
  if (req.user.role !== 'admin' && 
      (req.user.role !== 'driver' || ride.driverId !== req.user.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  ride.status = status;
  
  if (status === 'completed') {
    ride.endTime = new Date().toISOString();
    
    // Update driver earnings
    const driver = db.users.find(u => u.id === ride.driverId);
    if (driver) {
      driver.earnings += ride.fare;
    }
  }

  res.json({ message: 'Ride status updated', ride });
});

// ============ PAYMENT ROUTES ============

// Process payment
app.post('/api/payments', authenticateToken, (req, res) => {
  try {
    const { rideId, amount, method } = req.body;

    const ride = db.rides.find(r => r.id === rideId);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.passengerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const payment = {
      id: uuidv4(),
      rideId,
      passengerId: req.user.id,
      amount,
      method,
      status: 'completed', // In production, handle payment gateway
      transactionId: `TXN-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    db.payments.push(payment);
    ride.paymentStatus = 'completed';

    res.status(201).json({
      message: 'Payment processed successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all payments
app.get('/api/payments', authenticateToken, (req, res) => {
  let payments;

  if (req.user.role === 'admin') {
    payments = db.payments;
  } else {
    payments = db.payments.filter(p => p.passengerId === req.user.id);
  }

  res.json({ payments });
});

// ============ USER ROUTES ============

// Get all users (admin only)
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const users = db.users.map(u => ({ ...u, password: undefined }));
  res.json({ users });
});

// Get current user profile
app.get('/api/users/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user: { ...user, password: undefined } });
});

// Update user profile
app.put('/api/users/me', authenticateToken, async (req, res) => {
  const { name, phone, vehicleType, licensePlate } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (vehicleType && user.role === 'driver') user.vehicleType = vehicleType;
  if (licensePlate && user.role === 'driver') user.licensePlate = licensePlate;

  res.json({ message: 'Profile updated', user: { ...user, password: undefined } });
});

// Driver toggle online/offline status
app.put('/api/drivers/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ error: 'Driver access required' });
  }

  const { status } = req.body;
  const driver = db.users.find(u => u.id === req.user.id);
  
  driver.status = status; // 'online' or 'offline'

  res.json({ message: 'Status updated', driver: { ...driver, password: undefined } });
});

// ============ ADMIN ROUTES ============

// Get dashboard statistics
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const stats = {
    totalRides: db.rides.length,
    completedRides: db.rides.filter(r => r.status === 'completed').length,
    activeRides: db.rides.filter(r => r.status === 'in-progress').length,
    totalRevenue: db.payments.reduce((sum, p) => sum + p.amount, 0),
    totalDrivers: db.users.filter(u => u.role === 'driver').length,
    onlineDrivers: db.users.filter(u => u.role === 'driver' && u.status === 'online').length,
    totalPassengers: db.users.filter(u => u.role === 'passenger').length,
    todayRides: db.rides.filter(r => {
      const today = new Date().toDateString();
      return new Date(r.createdAt).toDateString() === today;
    }).length
  };

  res.json({ stats });
});

// Update settings
app.put('/api/admin/settings', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { emailNotifications, theme } = req.body;
  
  if (emailNotifications !== undefined) {
    db.settings.emailNotifications = emailNotifications;
  }
  if (theme) {
    db.settings.theme = theme;
  }

  res.json({ message: 'Settings updated', settings: db.settings });
});

// Get settings
app.get('/api/admin/settings', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  res.json({ settings: db.settings });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Diwai Fox Taxi Service API running on port ${PORT}`);
  
  // Create default admin user
  bcrypt.hash('admin123', 10).then(hashedPassword => {
    db.users.push({
      id: uuidv4(),
      email: 'admin@diwaifox.com',
      password: hashedPassword,
      name: 'Admin',
      phone: '+675-1234-5678',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    });
    console.log('Default admin created: admin@diwaifox.com / admin123');
  });
});