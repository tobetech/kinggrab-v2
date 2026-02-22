# การตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root ของโปรเจกต์ และเพิ่มข้อมูลต่อไปนี้:

```env
NEXT_PUBLIC_SUPABASE_URL=https://henhksozqbpacmptiaoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlbmhrc296cWJwYWNtcHRpYW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MzcxNDYsImV4cCI6MjA1NDIxMzE0Nn0.K5CUSZQsviKyvV6j3sGKhQ6TixieL82N0w0lRaM43kM
```

## วิธีหา Supabase URL และ Key

1. ไปที่ [Supabase Dashboard](https://app.supabase.com)
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ Settings > API
4. คัดลอก:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ตัวอย่าง

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**หมายเหตุ:** ไฟล์ `.env.local` จะไม่ถูก commit เข้า Git (อยู่ใน .gitignore แล้ว)
