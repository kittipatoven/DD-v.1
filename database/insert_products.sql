INSERT INTO products (name, description, price, stock, category_id, status, created_by) VALUES
('Intel Core i9-13900K', 'Latest Intel processor with 24 cores, 32 threads, 5.8GHz max boost', 18999.00, 50, 1, 'active', 1),
('AMD Ryzen 9 7950X', 'AMD flagship processor with 16 cores, 32 threads, 5.7GHz max boost', 17999.00, 45, 1, 'active', 1),
('NVIDIA RTX 4090', 'Top-tier graphics card with 24GB GDDR6X memory', 59999.00, 30, 2, 'active', 1),
('AMD Radeon RX 7900 XTX', 'High-end AMD GPU with 24GB GDDR6 memory', 44999.00, 25, 2, 'active', 1),
('Corsair Vengeance 32GB DDR5', '32GB DDR5-6000 RAM kit (2x16GB)', 2499.00, 100, 3, 'active', 1),
('Samsung 990 Pro 2TB', 'NVMe SSD with 7450MB/s read speed', 4599.00, 80, 4, 'active', 1),
('WD Black SN850X 1TB', 'High-performance NVMe SSD with 7300MB/s read', 2599.00, 90, 4, 'active', 1),
('Seagate Barracuda 4TB', '3.5" HDD with 7200RPM spin speed', 1499.00, 60, 5, 'active', 1),
('ASUS ROG Maximus Z790', 'Premium Intel Z790 motherboard with WiFi 6E', 12999.00, 35, 6, 'active', 1),
('MSI MPG B650 Carbon', 'AMD AM5 motherboard with PCIe 5.0 support', 8999.00, 40, 6, 'active', 1),
('Corsair RM1000x', '1000W 80+ Gold fully modular power supply', 5499.00, 55, 7, 'active', 1),
('Seasonic Focus GX-850', '850W 80+ Gold fully modular PSU', 4299.00, 65, 7, 'active', 1)
ON DUPLICATE KEY UPDATE name=name;
