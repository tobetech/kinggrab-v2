-- สร้างตาราง products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง sales
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  sale_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- สร้าง Policy สำหรับให้ authenticated users อ่านข้อมูลได้
CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

-- ข้อมูลตัวอย่าง (Optional - สำหรับทดสอบ)
-- INSERT INTO products (name, description, price, category) VALUES
-- ('สินค้า A', 'รายละเอียดสินค้า A', 100.00, 'Category 1'),
-- ('สินค้า B', 'รายละเอียดสินค้า B', 200.00, 'Category 1'),
-- ('สินค้า C', 'รายละเอียดสินค้า C', 150.00, 'Category 2');

-- INSERT INTO sales (product_id, quantity, total_amount, sale_date) VALUES
-- ((SELECT id FROM products WHERE name = 'สินค้า A'), 5, 500.00, CURRENT_DATE),
-- ((SELECT id FROM products WHERE name = 'สินค้า B'), 3, 600.00, CURRENT_DATE),
-- ((SELECT id FROM products WHERE name = 'สินค้า A'), 2, 200.00, CURRENT_DATE - INTERVAL '1 day');
