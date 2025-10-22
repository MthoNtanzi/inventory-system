-- ======================================================
-- SEED DATA FOR INVENTORY SYSTEM
-- ======================================================

-- Clear existing data and reset IDs
TRUNCATE TABLE sales, stock, products, users RESTART IDENTITY CASCADE;

-- Seed users
INSERT INTO users (username, password, email, role) VALUES
('admin1', 'admin123', 'admin@email.com', 'admin'),
('staff1', 'password1', 'staff@email.com', 'staff');

-- Seed products (now includes image_url)
INSERT INTO products (name, category, price, image_url) VALUES
('Laptop', 'Office', 15000.00, 'https://cdn.pixabay.com/photo/2016/11/21/15/46/computer-1846056_1280.jpg'),
('Mouse', 'Office', 250.00, 'https://cdn.pixabay.com/photo/2013/07/13/12/17/mouse-159568_960_720.png'),
('Keyboard', 'Office', 500.00, 'https://cdn.pixabay.com/photo/2024/04/17/01/59/mechanical-keyboard-8701176_960_720.png'),
('Desk Chair', 'Furniture', 2200.00, 'https://cdn.pixabay.com/photo/2021/09/26/11/44/chair-6657317_960_720.jpg'),
('Monitor', 'Office', 3500.00, 'https://cdn.pixabay.com/photo/2020/06/07/07/23/online-learning-5269378_960_720.jpg');

-- Seed stock (linked by product_id)
INSERT INTO stock (product_id, quantity) VALUES
(1, 10),
(2, 50),
(3, 30),
(4, 15),
(5, 20);

-- Optional: seed example sales (for testing)
INSERT INTO sales (product_id, user_id, quantity, total_price)
VALUES
(1, 1, 2, 30000.00),
(2, 2, 5, 1250.00),
(3, 2, 1, 500.00);

-- Verification log
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_stock_items FROM stock;
SELECT COUNT(*) AS total_sales FROM sales;
