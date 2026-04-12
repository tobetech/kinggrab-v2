import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = createServiceClient()
    const { data, error } = await admin
      .from('reward_catalog')
      .select('id, name, description, image_url, points_cost, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ items: data ?? [] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'โหลดรายการของรางวัลไม่สำเร็จ'
    console.error('line/rewards', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
