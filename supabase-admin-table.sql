-- สร้างตาราง admin สำหรับเก็บข้อมูล admin
-- รัน SQL นี้ใน Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'admin',
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email);
CREATE INDEX IF NOT EXISTS idx_admin_role ON admin(role);

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับให้ authenticated users อ่านข้อมูลของตัวเองได้ (ตาม email)
CREATE POLICY "Allow authenticated users to read own admin data"
  ON admin FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy สำหรับให้ authenticated users อ่านข้อมูลทั้งหมดได้ (ถ้าต้องการให้ทุกคนเห็น)
-- ถ้าไม่ต้องการให้ comment บรรทัดนี้
CREATE POLICY "Allow authenticated users to read admin"
  ON admin FOR SELECT
  TO authenticated
  USING (true);

-- Function สำหรับ trigger อัปเดต updated_at
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger สำหรับอัปเดต updated_at
CREATE TRIGGER update_admin_updated_at BEFORE UPDATE
    ON admin FOR EACH ROW
    EXECUTE FUNCTION update_admin_updated_at();

-- ข้อมูลตัวอย่าง (Optional)
-- INSERT INTO admin (email, name, role, status) VALUES
-- ('admin@example.com', 'Admin User', 'admin', 'Active'),
-- ('superadmin@example.com', 'Super Admin', 'superadmin', 'Active');
