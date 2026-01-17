# Sales Dashboard with Supabase

Dashboard สำหรับแสดงยอดขายสินค้าแยกตาม product โดยใช้ Supabase เป็นฐานข้อมูล

## คุณสมบัติ

- 🔐 ระบบ Login/Authentication ด้วย Supabase Auth
- 📊 Dashboard แสดงยอดขายแยกตามสินค้า
- 📈 สรุปยอดขายรวม, จำนวนสินค้า, และจำนวนรายการ
- 🎨 UI สวยงามและใช้งานง่าย
- 📱 Responsive Design

## ข้อกำหนดเบื้องต้น

- Node.js 18+ 
- npm หรือ yarn
- Supabase Project

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. สร้างไฟล์ `.env.local` และกรอกข้อมูล Supabase:
```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## การตั้งค่า Supabase Database

สร้างตารางใน Supabase SQL Editor:

```sql
-- สร้างตาราง products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง sales
CREATE TABLE sales (
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
```

## การรันโปรเจกต์

รัน development server:
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## โครงสร้างโปรเจกต์

```
supabase-dashboard/
├── app/
│   ├── dashboard/      # หน้า Dashboard
│   ├── login/          # หน้า Login
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page (redirect)
│   └── globals.css     # Global styles
├── lib/
│   ├── supabase.ts     # Supabase client
│   └── types.ts        # TypeScript types
└── package.json
```

## การใช้งาน

1. สร้างบัญชีผู้ใช้ใน Supabase Authentication
2. เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
3. ดู Dashboard ที่แสดงยอดขายแยกตามสินค้า

## เทคโนโลยีที่ใช้

- **Next.js 14** - React Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend as a Service
- **React Icons** - Icons

## License

MIT
