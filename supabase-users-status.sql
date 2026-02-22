-- เพิ่ม field status ในตาราง users
-- รัน SQL นี้ใน Supabase SQL Editor

-- เพิ่ม field status (ถ้ายังไม่มี)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT;

-- ตัวอย่างการอัปเดต status สำหรับ user
-- UPDATE users SET status = 'Active' WHERE email = 'user@example.com';
-- UPDATE users SET status = 'Inactive' WHERE email = 'user2@example.com';
-- UPDATE users SET status = 'Pending' WHERE email = 'user3@example.com';

-- หมายเหตุ:
-- 1. field status เป็น TEXT สามารถใส่ค่าใดก็ได้ เช่น 'Active', 'Inactive', 'Pending', 'Suspended' เป็นต้น
-- 2. ถ้าต้องการให้เป็น enum สามารถใช้ CHECK constraint ได้
