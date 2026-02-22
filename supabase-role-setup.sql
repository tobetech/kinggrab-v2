-- สร้างตาราง users สำหรับเก็บ role และ allowed_actions
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  allowed_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เปิดใช้งาน Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับให้ users อ่านข้อมูลของตัวเองได้
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy สำหรับให้ admin อ่านข้อมูลทั้งหมดได้
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ตัวอย่างการตั้งค่า user เป็น admin
-- UPDATE users SET role = 'admin' WHERE id = 'user-uuid-here';

-- ตัวอย่างการตั้งค่า user พร้อม allowed_actions
-- UPDATE users SET 
--   role = 'user',
--   allowed_actions = ARRAY['PLAY', 'TOPUP']
-- WHERE id = 'user-uuid-here';

-- Function สำหรับ trigger อัปเดต updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger สำหรับอัปเดต updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
