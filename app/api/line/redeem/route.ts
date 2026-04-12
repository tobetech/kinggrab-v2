import { NextResponse } from 'next/server'
import { verifyLineIdToken, getBearerToken } from '@/lib/line-auth'
import { createServiceClient } from '@/lib/supabase-admin'
import { loadMemberSnapshot } from '@/lib/member-service'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: 'ต้องเข้าสู่ระบบ LINE' }, { status: 401 })
    }
    const { lineUserId } = await verifyLineIdToken(token)
    const body = (await request.json()) as { rewardId?: string }
    const rewardId = typeof body.rewardId === 'string' ? body.rewardId : ''

    if (!rewardId) {
      return NextResponse.json({ error: 'ไม่พบรหัสของรางวัล' }, { status: 400 })
    }

    const admin = createServiceClient()
    const snap = await loadMemberSnapshot(admin, lineUserId)

    if (!snap.linked) {
      return NextResponse.json({ error: 'กรุณาเชื่อมเบอร์โทรก่อน' }, { status: 403 })
    }

    const { data: reward, error: rErr } = await admin
      .from('reward_catalog')
      .select('id, name, points_cost, active')
      .eq('id', rewardId)
      .maybeSingle()

    if (rErr) throw rErr
    if (!reward || !reward.active) {
      return NextResponse.json({ error: 'ไม่พบของรางวัลหรือปิดการแลกแล้ว' }, { status: 404 })
    }

    if (snap.pointsBalance < reward.points_cost) {
      return NextResponse.json(
        { error: `คะแนนไม่พอ (ต้องการ ${reward.points_cost} มี ${snap.pointsBalance})` },
        { status: 400 }
      )
    }

    const { error: insErr } = await admin.from('reward_redemptions').insert({
      line_user_id: lineUserId,
      reward_catalog_id: reward.id,
      points_cost: reward.points_cost,
      status: 'approved',
    })

    if (insErr) throw insErr

    const after = await loadMemberSnapshot(admin, lineUserId)

    return NextResponse.json({
      ok: true,
      redeemed: reward.name,
      pointsCost: reward.points_cost,
      snapshot: after.linked ? after : null,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'แลกของไม่สำเร็จ'
    console.error('line/redeem', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
