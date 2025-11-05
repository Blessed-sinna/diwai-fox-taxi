-- Create database
CREATE DATABASE diwaifox;

-- Connect to database
\c diwaifox

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('passenger', 'driver', 'admin')),
    vehicle_type VARCHAR(50),
    license_plate VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    earnings DECIMAL(10, 2) DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rides table
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID REFERENCES users(id),
    driver_id UUID REFERENCES users(id),
    pickup_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    distance DECIMAL(10, 2) NOT NULL,
    fare DECIMAL(10, 2) NOT NULL,
    eta INTEGER,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in-progress', 'completed', 'cancelled')),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_time TIMESTAMP,
    end_time TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id),
    passenger_id UUID REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT true,
    theme VARCHAR(50) DEFAULT 'gold'
);

-- Create indexes
CREATE INDEX idx_rides_passenger ON rides(passenger_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_payments_ride ON payments(ride_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Insert default settings
INSERT INTO settings (email_notifications, theme) VALUES (true, 'gold');