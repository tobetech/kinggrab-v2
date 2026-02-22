-- เปิดใช้งาน Realtime สำหรับตาราง smartcard
-- รัน SQL นี้ใน Supabase SQL Editor

-- ตรวจสอบว่า Realtime เปิดใช้งานอยู่หรือไม่
-- ถ้ายังไม่เปิด ให้เปิดใน Supabase Dashboard > Database > Replication

-- สำหรับ Supabase CLI หรือ SQL Editor:
-- เปิดใช้งาน Realtime replication สำหรับตาราง smartcard
ALTER PUBLICATION supabase_realtime ADD TABLE smartcard;

-- ตรวจสอบว่าเปิดใช้งานแล้ว
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- หมายเหตุ:
-- 1. ไปที่ Supabase Dashboard > Database > Replication
-- 2. หาตาราง smartcard
-- 3. เปิด toggle สำหรับ Realtime
-- 4. หรือรัน SQL ด้านบน
