import React, { useState, useEffect } from 'react';
import { MapPin, Car, DollarSign, Clock, User, Settings, LogOut, Menu, X } from 'lucide-react';

const API_URL = 'https://diwai-fox-taxi.onrender.com/api';

// Main App Component
export default function DiwaiFoxApp() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('login');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    }
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setCurrentView(data.user.role === 'admin' ? 'adminDashboard' : 
                       data.user.role === 'driver' ? 'driverDashboard' : 'booking');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setCurrentView(data.user.role === 'admin' ? 'adminDashboard' : 
                       data.user.role === 'driver' ? 'driverDashboard' : 'booking');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setCurrentView(data.user.role === 'admin' ? 'adminDashboard' : 
                       data.user.role === 'driver' ? 'driverDashboard' : 'booking');
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('Registration error: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('login');
  };

  if (!token || !user) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
      <main className="container mx-auto px-4 py-6">
        {user.role === 'passenger' && currentView === 'booking' && (
          <PassengerBooking token={token} user={user} />
        )}
        {user.role === 'driver' && currentView === 'driverDashboard' && (
          <DriverDashboard token={token} user={user} />
        )}
        {user.role === 'admin' && currentView === 'adminDashboard' && (
          <AdminDashboard token={token} />
        )}
        {user.role === 'admin' && currentView === 'users' && (
          <UserManagement token={token} />
        )}
        {user.role === 'admin' && currentView === 'allRides' && (
          <AllRides token={token} />
        )}
        {user.role === 'admin' && currentView === 'payments' && (
          <PaymentManagement token={token} />
        )}
        {currentView === 'myRides' && (
          <MyRides token={token} user={user} />
        )}
      </main>
    </div>
  );
}

// Header Component
function Header({ user, onLogout, currentView, setCurrentView }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Diwai Fox Taxi</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user.role === 'passenger' && (
              <>
                <button onClick={() => setCurrentView('booking')} 
                        className={`px-4 py-2 rounded ${currentView === 'booking' ? 'bg-white text-amber-600' : 'hover:bg-amber-600'}`}>
                  Book Ride
                </button>
                <button onClick={() => setCurrentView('myRides')} 
                        className={`px-4 py-2 rounded ${currentView === 'myRides' ? 'bg-white text-amber-600' : 'hover:bg-amber-600'}`}>
                  My Rides
                </button>
              </>
            )}
            
            {user.role === 'driver' && (
              <>
                <button onClick={() => setCurrentView('driverDashboard')} 
                        className={`px-4 py-2 rounded ${currentView === 'driverDashboard' ? 'bg-white text-amber-600' : 'hover:bg-amber-600'}`}>
                  Dashboard
                </button>
                <button onClick={() => setCurrentView('myRides')} 
                        className={`px-4 py-2 rounded ${currentView === 'myRides' ? 'bg-white text-amber-600' : 'hover:bg-amber-600'}`}>
                  My Rides
                </button>
              </>
            )}
            
            {user.role === 'admin' && (
              <>
                <button onClick={() => setCurrentView('adminDashboard')} 
                        className={`px-4 py-2 rounded ${currentView === 'adminDashboard' ? 'bg-white text-amber-600' : 'hover:bg-amber-600'}`}>
                  Dashboard
                </button>
                <button onClick={() => setCurrentView('users')} 
                        className={`px-4 py-2 rounded ${currentView === 'users' ? 'bg-white text-amber-600' : 'hover:bg-amber-600'}`}>
                  Users
                </button>
                <button onClick={() => setCurrentView('allRides')} 
                        className={`px-4 py-2 rounded ${currentView === 'allRides' ? 'bg-white text-amber-600' : 'hover:bg-amber-600'}`}>
                  Rides
                </button>
                <button onClick={() => setCurrentView('payments')} 
                        className={`px-4 py-2 rounded ${currentView === 'payments' ? 'bg-white text-amber-600' : 'hover:bg-amber-600'}`}>
                  Payments
                </button>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{user.name}</span>
            </div>
            <button onClick={onLogout} className="flex items-center space-x-1 hover:bg-amber-600 px-4 py-2 rounded">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            {user.role === 'passenger' && (
              <>
                <button onClick={() => { setCurrentView('booking'); setMenuOpen(false); }} 
                        className="block w-full text-left px-4 py-2 hover:bg-amber-600 rounded">
                  Book Ride
                </button>
                <button onClick={() => { setCurrentView('myRides'); setMenuOpen(false); }} 
                        className="block w-full text-left px-4 py-2 hover:bg-amber-600 rounded">
                  My Rides
                </button>
              </>
            )}
            <button onClick={onLogout} className="block w-full text-left px-4 py-2 hover:bg-amber-600 rounded">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Auth Screen
function AuthScreen({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'passenger',
    vehicleType: '',
    licensePlate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin({ email: formData.email, password: formData.password });
    } else {
      onRegister(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Car className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Diwai Fox Taxi
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="passenger">Passenger</option>
                <option value="driver">Driver</option>
              </select>
              
              {formData.role === 'driver' && (
                <>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                  </select>
                  <input
                    type="text"
                    placeholder="License Plate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </>
              )}
            </>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
          
          <button
            type="submit"
            className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition duration-200"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Passenger Booking Component
function PassengerBooking({ token, user }) {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('sedan');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handleBookRide = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${API_URL}/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pickupLocation: pickup,
          destination,
          vehicleType,
          paymentMethod
        })
      });
      
      const data = await res.json();
      
      if (data.ride) {
        alert(`Ride booked successfully! Fare: K${data.ride.fare}, ETA: ${data.ride.eta} mins`);
        setPickup('');
        setDestination('');
      } else {
        alert(data.error || 'Booking failed');
      }
    } catch (error) {
      alert('Error booking ride: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Book a Ride</h2>
        
        <form onSubmit={handleBookRide} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Pickup Location</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter pickup location"
                className="flex-1 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Destination</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                className="flex-1 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="sedan">Sedan - K2/km</option>
              <option value="suv">SUV - K3/km</option>
              <option value="van">Van - K1.5/km</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition duration-200"
          >
            Book Ride
          </button>
        </form>
      </div>
    </div>
  );
}

// Driver Dashboard Component
function DriverDashboard({ token, user }) {
  const [rides, setRides] = useState([]);
  const [isOnline, setIsOnline] = useState(user.status === 'online');

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await fetch(`${API_URL}/rides`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRides(data.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = isOnline ? 'offline' : 'online';
      const res = await fetch(`${API_URL}/drivers/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setIsOnline(!isOnline);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const acceptRide = async (rideId) => {
    try {
      const res = await fetch(`${API_URL}/rides/${rideId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert('Ride accepted!');
        fetchRides();
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
    }
  };

  const updateRideStatus = async (rideId, status) => {
    try {
      const res = await fetch(`${API_URL}/rides/${rideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        alert('Ride status updated!');
        fetchRides();
      }
    } catch (error) {
      console.error('Error updating ride:', error);
    }
  };

  const pendingRides = rides.filter(r => r.status === 'pending');
  const activeRides = rides.filter(r => r.driverId === user.id && ['accepted', 'in-progress'].includes(r.status));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Status</p>
              <p className="text-2xl font-bold">{isOnline ? 'Online' : 'Offline'}</p>
            </div>
            <button
              onClick={toggleOnlineStatus}
              className={`px-4 py-2 rounded-lg ${isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              Go {isOnline ? 'Offline' : 'Online'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold">K{user.earnings?.toFixed(2) || '0.00'}</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Rating</p>
              <p className="text-2xl font-bold">{user.rating?.toFixed(1) || '5.0'} ⭐</p>
            </div>
          </div>
        </div>
      </div>

      {isOnline && pendingRides.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Available Rides</h3>
          <div className="space-y-3">
            {pendingRides.map(ride => (
              <div key={ride.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Pickup: {ride.pickupLocation}</p>
                    <p className="text-gray-600">Destination: {ride.destination}</p>
                    <p className="text-sm text-gray-500">{ride.distance} km • {ride.vehicleType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">K{ride.fare}</p>
                    <p className="text-sm text-gray-500">{ride.eta} min ETA</p>
                  </div>
                </div>
                <button
                  onClick={() => acceptRide(ride.id)}
                  className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600"
                >
                  Accept Ride
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeRides.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Active Rides</h3>
          <div className="space-y-3">
            {activeRides.map(ride => (
              <div key={ride.id} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-2">
                  <p className="font-semibold">Passenger: {ride.passenger?.name}</p>
                  <p className="text-gray-600">From: {ride.pickupLocation}</p>
                  <p className="text-gray-600">To: {ride.destination}</p>
                  <p className="font-bold text-green-600 mt-2">Fare: K{ride.fare}</p>
                  <p className="text-sm text-gray-500">Status: {ride.status}</p>
                </div>
                <div className="flex space-x-2">
                  {ride.status === 'accepted' && (
                    <button
                      onClick={() => updateRideStatus(ride.id, 'in-progress')}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                    >
                      Start Trip
                    </button>
                  )}
                  {ride.status === 'in-progress' && (
                    <button
                      onClick={() => updateRideStatus(ride.id, 'completed')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                    >
                      Complete Trip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Total Rides</p>
          <p className="text-3xl font-bold">{stats.totalRides}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Completed Rides</p>
          <p className="text-3xl font-bold">{stats.completedRides}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Active Rides</p>
          <p className="text-3xl font-bold">{stats.activeRides}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold">K{stats.totalRevenue?.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Total Drivers</p>
          <p className="text-3xl font-bold">{stats.totalDrivers}</p>
          <p className="text-sm text-green-600">{stats.onlineDrivers} online</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Total Passengers</p>
          <p className="text-3xl font-bold">{stats.totalPassengers}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Today's Rides</p>
          <p className="text-3xl font-bold">{stats.todayRides}</p>
        </div>
      </div>
    </div>
  );
}

// User Management Component
function UserManagement({ token }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'driver' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'online' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status || 'active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// All Rides Component
function AllRides({ token }) {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await fetch(`${API_URL}/rides`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRides(data.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Rides</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rides.map(ride => (
              <tr key={ride.id}>
                <td className="px-6 py-4 whitespace-nowrap">{ride.passenger?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ride.driver?.name || 'Not assigned'}</td>
                <td className="px-6 py-4">{ride.pickupLocation}</td>
                <td className="px-6 py-4">{ride.destination}</td>
                <td className="px-6 py-4 whitespace-nowrap">K{ride.fare}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                    ride.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    ride.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                    ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ride.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Payment Management Component
function PaymentManagement({ token }) {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_URL}/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(payment => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap">{payment.transactionId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.rideId.substring(0, 8)}...</td>
                <td className="px-6 py-4 whitespace-nowrap">K{payment.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.method}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// My Rides Component
function MyRides({ token, user }) {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await fetch(`${API_URL}/rides`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRides(data.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Rides</h2>
      
      <div className="space-y-4">
        {rides.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No rides yet</p>
        ) : (
          rides.map(ride => (
            <div key={ride.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {ride.pickupLocation} → {ride.destination}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {user.role === 'passenger' && ride.driver ? `Driver: ${ride.driver.name}` : ''}
                    {user.role === 'driver' && ride.passenger ? `Passenger: ${ride.passenger.name}` : ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    {ride.distance} km • {ride.vehicleType}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ride.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">K{ride.fare}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                    ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                    ride.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    ride.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                    ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ride.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Payment: {ride.paymentMethod} • Status: {ride.paymentStatus}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}