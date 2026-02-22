-- เพิ่มข้อมูลตัวอย่างในตาราง admin
-- แก้ไข email ให้ตรงกับ email ที่ใช้ login

-- ตัวอย่าง: เพิ่มข้อมูล admin สำหรับ email ที่ใช้ login
-- แก้ไข email ด้านล่างให้ตรงกับ email ที่คุณใช้ login
INSERT INTO admin (email, name, role, status)
VALUES 
  ('your-email@example.com', 'Your Name', 'admin', 'Active')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- หรือถ้าต้องการเพิ่มหลายคน
-- INSERT INTO admin (email, name, role, status)
-- VALUES 
--   ('admin1@example.com', 'Admin 1', 'admin', 'Active'),
--   ('admin2@example.com', 'Admin 2', 'admin', 'Active'),
--   ('user@example.com', 'Regular User', 'user', 'Active')
-- ON CONFLICT (email) DO UPDATE SET
--   name = EXCLUDED.name,
--   role = EXCLUDED.role,
--   status = EXCLUDED.status;
