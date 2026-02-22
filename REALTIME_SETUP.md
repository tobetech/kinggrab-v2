# วิธีเปิดใช้งาน Supabase Realtime

## ปัญหา: Realtime Update ไม่ทำงาน

## วิธีแก้ไข

### วิธีที่ 1: ผ่าน Supabase Dashboard (แนะนำ)

1. เปิด Supabase Dashboard
2. ไปที่ **Database** → **Replication**
3. หาตาราง **smartcard**
4. เปิด toggle สำหรับ **Realtime** (ควรเป็นสีเขียว)
5. รอสักครู่แล้ว refresh หน้า Dashboard

### วิธีที่ 2: ผ่าน SQL Editor

1. เปิด Supabase Dashboard → **SQL Editor**
2. รัน SQL นี้:

```sql
-- เปิดใช้งาน Realtime สำหรับตาราง smartcard
ALTER PUBLICATION supabase_realtime ADD TABLE smartcard;
```

3. ตรวจสอบว่าเปิดใช้งานแล้ว:

```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'smartcard';
```

### วิธีที่ 3: ตรวจสอบ Row Level Security (RLS)

ถ้า Realtime ยังไม่ทำงาน อาจเป็นเพราะ RLS Policy:

1. ไปที่ **Database** → **Tables** → **smartcard**
2. ตรวจสอบว่า RLS เปิดใช้งาน
3. ตรวจสอบ Policy ว่ามีสิทธิ์ SELECT หรือไม่:

```sql
-- ตรวจสอบ Policy
SELECT * FROM pg_policies 
WHERE tablename = 'smartcard';

-- ถ้าไม่มี Policy สำหรับ SELECT ให้สร้าง:
CREATE POLICY "Allow authenticated users to read smartcard"
  ON smartcard FOR SELECT
  TO authenticated
  USING (true);
```

## วิธีทดสอบ

1. เปิด Browser Console (F12)
2. ดู logs:
   - `Setting up realtime subscription...`
   - `Realtime subscription status: SUBSCRIBED` ← ควรเห็นข้อความนี้
3. เพิ่มข้อมูลใหม่ใน Supabase Table Editor
4. ดู Console ว่ามี log `Realtime change detected:` หรือไม่
5. ข้อมูลใน Dashboard ควรอัปเดตอัตโนมัติ

## Troubleshooting

### ถ้ายังไม่ทำงาน:

1. **ตรวจสอบ Browser Console**:
   - ดู error messages
   - ตรวจสอบว่า subscription status เป็น `SUBSCRIBED` หรือไม่

2. **ตรวจสอบ Supabase Dashboard**:
   - Database → Replication → smartcard → Realtime เปิดอยู่หรือไม่

3. **ตรวจสอบ RLS Policy**:
   - ต้องมี Policy สำหรับ SELECT

4. **ลอง Refresh หน้าเว็บ**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) หรือ `Cmd+Shift+R` (Mac)

5. **ตรวจสอบ Network Tab**:
   - เปิด Developer Tools → Network
   - ดูว่ามี WebSocket connection หรือไม่

## หมายเหตุ

- Realtime ต้องเปิดใช้งานใน Supabase Dashboard ก่อน
- ต้องมีสิทธิ์ในการอ่านตาราง (SELECT permission)
- WebSocket connection ต้องทำงานได้
