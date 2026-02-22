-- สร้างตาราง users สำหรับเก็บข้อมูลผู้ใช้
-- ตารางนี้เชื่อมโยงกับ Supabase Auth

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  allowed_actions TEXT[],
  allowed_tel_nos TEXT[],
  allowed_m_names TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับให้ users อ่านข้อมูลของตัวเองได้
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy สำหรับให้ users อ่านข้อมูลของผู้อื่นได้ (สำหรับ admin)
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy สำหรับให้ users แก้ไขข้อมูลของตัวเองได้
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy สำหรับให้ insert ได้เมื่อ sign up (ใช้ trigger)
-- หรือใช้ service_role key

-- สร้าง function สำหรับอัปเดต updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง trigger สำหรับอัปเดต updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- หมายเหตุ:
-- 1. ตาราง users จะเชื่อมโยงกับ auth.users โดยใช้ id
-- 2. เมื่อ sign up สำเร็จ ต้อง insert ข้อมูลในตาราง users ด้วย
-- 3. ถ้าต้องการให้ insert อัตโนมัติ ใช้ trigger หรือ function
