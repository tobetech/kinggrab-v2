-- ระบบสมาชิก LINE (LIFF) — เชื่อม tel_no กับ smartcard และแลกของด้วยคะแนน
-- รันใน Supabase SQL Editor หลังมีตาราง smartcard แล้ว

-- เชื่อม LINE User กับเบอร์โทรที่มีใน smartcard
CREATE TABLE IF NOT EXISTS member_line_links (
  line_user_id TEXT PRIMARY KEY,
  tel_no TEXT NOT NULL,
  m_name TEXT,
  display_name TEXT,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT member_line_links_tel_no_key UNIQUE (tel_no)
);

CREATE INDEX IF NOT EXISTS idx_member_line_links_tel_no ON member_line_links(tel_no);

-- สินค้า/ของรางวัลแลกคะแนน
CREATE TABLE IF NOT EXISTS reward_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_catalog_active ON reward_catalog(active);

-- ประวัติการแลกของ
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT NOT NULL REFERENCES member_line_links(line_user_id) ON DELETE CASCADE,
  reward_catalog_id UUID NOT NULL REFERENCES reward_catalog(id) ON DELETE RESTRICT,
  points_cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_redemptions_line_user ON reward_redemptions(line_user_id);

-- RLS: ไม่ให้ client อ่านโดยตรง — ใช้ Next.js API + service_role เท่านั้น
ALTER TABLE member_line_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- ไม่สร้าง policy สำหรับ anon/authenticated = บล็อกจากภายนอก (service_role ยังทำงานได้)

COMMENT ON TABLE member_line_links IS 'เชื่อม LINE user กับ tel_no จาก smartcard';
COMMENT ON TABLE reward_catalog IS 'รายการของแลกคะแนนสำหรับลูกค้า LINE';
COMMENT ON TABLE reward_redemptions IS 'ประวัติการแลก — status เริ่มต้น approved สำหรับ MVP (ปรับเป็น pending ถ้าให้แอดมินอนุมัติ)';

-- ตัวอย่างของรางวัล (แก้ URL รูปเป็นรูปจริง / Supabase Storage ได้) — รันครั้งเดียว
INSERT INTO reward_catalog (name, description, image_url, points_cost, active, sort_order)
SELECT * FROM (VALUES
  ('กาแฟร้อน 1 แก้ว', 'แลกที่เคาน์เตอร์ภายใน 7 วัน', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80', 150, true, 1),
  ('เค้กชิ้นเล็ก', 'รสชาติตามรอบเดือน', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', 300, true, 2),
  ('ส่วนลด 50 บาท', 'ใช้กับบริการครั้งถัดไป', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', 500, true, 3)
) AS v(name, description, image_url, points_cost, active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM reward_catalog LIMIT 1);
