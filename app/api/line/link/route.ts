import { NextResponse } from 'next/server'
import { verifyLineIdToken, getBearerToken } from '@/lib/line-auth'
import { createServiceClient } from '@/lib/supabase-admin'
import { normalizeThaiPhone } from '@/lib/member-stats'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: 'ต้องเข้าสู่ระบบ LINE' }, { status: 401 })
    }
    const { lineUserId, displayName } = await verifyLineIdToken(token)
    const body = (await request.json()) as { telNo?: string }
    const tel = normalizeThaiPhone(typeof body.telNo === 'string' ? body.telNo : '')
    if (tel.length < 9) {
      return NextResponse.json({ error: 'รูปแบบเบอร์โทรไม่ถูกต้อง' }, { status: 400 })
    }

    const admin = createServiceClient()
    const { count, error: countErr } = await admin
      .from('smartcard')
      .select('id', { count: 'exact', head: true })
      .eq('tel_no', tel)

    if (countErr) throw countErr
    if (!count) {
      return NextResponse.json(
        { error: 'ไม่พบรายการในระบบด้วยเบอร์นี้ กรุณาใช้เบอร์เดียวกับที่ลงทะเบียนในร้าน' },
        { status: 404 }
      )
    }

    const { data: existingTel, error: exErr } = await admin
      .from('member_line_links')
      .select('line_user_id')
      .eq('tel_no', tel)
      .maybeSingle()

    if (exErr) throw exErr
    if (existingTel && existingTel.line_user_id !== lineUserId) {
      return NextResponse.json(
        { error: 'เบอร์นี้เชื่อมกับบัญชี LINE อื่นแล้ว' },
        { status: 409 }
      )
    }

    const { data: latest, error: latestErr } = await admin
      .from('smartcard')
      .select('M_Name')
      .eq('tel_no', tel)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestErr) throw latestErr

    const { error: upErr } = await admin.from('member_line_links').upsert(
      {
        line_user_id: lineUserId,
        tel_no: tel,
        m_name: latest?.M_Name ?? null,
        display_name: displayName ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'line_user_id' }
    )

    if (upErr) throw upErr

    return NextResponse.json({ ok: true, telNo: tel, mName: latest?.M_Name ?? null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'ผิดพลาดภายใน'
    if (msg.includes('LINE_CHANNEL_ID') || msg.includes('jwtVerify')) {
      return NextResponse.json({ error: 'ตรวจสอบการตั้งค่า LINE (LINE_CHANNEL_ID / token)' }, { status: 500 })
    }
    console.error('line/link', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
