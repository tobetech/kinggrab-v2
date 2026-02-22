-- สร้าง trigger สำหรับ insert ข้อมูลในตาราง users อัตโนมัติเมื่อ sign up
-- รัน SQL นี้ใน Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'user' -- default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้าง trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- หมายเหตุ:
-- 1. Trigger นี้จะทำงานอัตโนมัติเมื่อมีการ sign up ใหม่
-- 2. จะ insert ข้อมูลในตาราง users โดยอัตโนมัติ
-- 3. ถ้าใช้ trigger นี้แล้ว ไม่ต้อง insert ในโค้ด frontend
