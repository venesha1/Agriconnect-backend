-- Produce_Requests Table
-- This table stores produce requests from buyers, creating a guaranteed market for farmers.
CREATE TABLE Produce_Requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    quantity_needed VARCHAR(255) NOT NULL,
    specifications TEXT,
    desired_start_date DATE NOT NULL,
    status ENUM('Open', 'Fulfilled', 'Cancelled') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id)
);
