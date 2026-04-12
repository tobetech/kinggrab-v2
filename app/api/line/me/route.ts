import { NextResponse } from 'next/server'
import { verifyLineIdToken, getBearerToken } from '@/lib/line-auth'
import { createServiceClient } from '@/lib/supabase-admin'
import { loadMemberSnapshot } from '@/lib/member-service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: 'ต้องเข้าสู่ระบบ LINE' }, { status: 401 })
    }
    const { lineUserId } = await verifyLineIdToken(token)
    const admin = createServiceClient()
    const snap = await loadMemberSnapshot(admin, lineUserId)

    if (!snap.linked) {
      return NextResponse.json({
        linked: false,
      })
    }

    return NextResponse.json({
      linked: true,
      telNo: snap.telNo,
      mName: snap.mName,
      balanceBaht: snap.balanceBaht,
      pointsEarned: snap.pointsEarned,
      pointsSpent: snap.pointsSpent,
      pointsBalance: snap.pointsBalance,
      bahtPerPoint: snap.bahtPerPoint,
      balanceNote:
        'ยอดนี้คิดจากผลรวมคอลัมน์ amount ทุกรายการใน smartcard ที่ tel_no ตรงกัน (ตามเดียวกับแดชบอร์ดหลังบ้าน)',
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'ผิดพลาดภายใน'
    console.error('line/me', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
