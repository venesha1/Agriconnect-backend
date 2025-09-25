-- Users Table
-- This table stores information about both 'Farmer' and 'Buyer' users.
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role ENUM('Farmer', 'Buyer') NOT NULL,
    rada_registration_number VARCHAR(100),
    rada_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
-- This table lists the produce available for sale by farmers.
CREATE TABLE Products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Orders Table
-- This table tracks all purchase orders made by buyers.
CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    payment_method ENUM('Digital', 'Offline') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Order_Items Table
-- This is a linking table to associate multiple products with a single order.
CREATE TABLE Order_Items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_purchased INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- Lend_Hand_Events Table
-- This table is for the community hub, allowing farmers to post events.
CREATE TABLE Lend_Hand_Events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    host_farmer_id INT NOT NULL,
    event_date DATETIME NOT NULL,
    task_description TEXT NOT NULL,
    required_volunteers INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_farmer_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Event_Volunteers Table
-- This linking table tracks which users have RSVP'd for Lend Hand events.
CREATE TABLE Event_Volunteers (
    event_volunteer_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    rsvp_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES Lend_Hand_Events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    UNIQUE (event_id, volunteer_id)
);

