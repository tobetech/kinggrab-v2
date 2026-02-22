-- สร้างตาราง smartcard สำหรับ Transaction Dashboard
-- ตารางนี้ใช้สำหรับเก็บข้อมูลการทำรายการ

CREATE TABLE IF NOT EXISTS smartcard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  Card_No TEXT,
  tel_no TEXT,
  M_Name TEXT NOT NULL,
  action TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index เพื่อเพิ่มความเร็วในการ query
CREATE INDEX IF NOT EXISTS idx_smartcard_created_at ON smartcard(created_at);
CREATE INDEX IF NOT EXISTS idx_smartcard_tel_no ON smartcard(tel_no);
CREATE INDEX IF NOT EXISTS idx_smartcard_action ON smartcard(action);
CREATE INDEX IF NOT EXISTS idx_smartcard_m_name ON smartcard(M_Name);

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE smartcard ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับให้ authenticated users อ่านข้อมูลได้
CREATE POLICY "Allow authenticated users to read smartcard"
  ON smartcard FOR SELECT
  TO authenticated
  USING (true);

-- Policy สำหรับให้ authenticated users เพิ่มข้อมูลได้ (ถ้าต้องการ)
CREATE POLICY "Allow authenticated users to insert smartcard"
  ON smartcard FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ข้อมูลตัวอย่าง (Optional - สำหรับทดสอบ)
-- INSERT INTO smartcard (Card_No, tel_no, M_Name, action, amount, created_at) VALUES
-- ('CARD001', '0812345678', 'M001', 'Play', 1500.00, NOW()),
-- ('CARD002', '0823456789', 'M002', 'Topup', 5000.00, NOW()),
-- ('CARD003', '0834567890', 'M001', 'Refund', -500.00, NOW()),
-- ('CARD004', '0845678901', 'M003', 'Redeem', 2000.00, NOW()),
-- ('CARD005', '0856789012', 'M002', 'Addcard', 1000.00, NOW());
