import type { SupabaseClient } from '@supabase/supabase-js'
import {
  computeNetBalanceFromTransactions,
  computePointsEarnedFromTopups,
  getBahtPerPoint,
} from '@/lib/member-stats'

export type MemberSnapshot =
  | { linked: false }
  | {
      linked: true
      telNo: string
      mName: string | null
      balanceBaht: number
      pointsEarned: number
      pointsSpent: number
      pointsBalance: number
      bahtPerPoint: number
    }

export async function loadMemberSnapshot(
  admin: SupabaseClient,
  lineUserId: string
): Promise<MemberSnapshot> {
  const { data: link, error: linkErr } = await admin
    .from('member_line_links')
    .select('tel_no, m_name')
    .eq('line_user_id', lineUserId)
    .maybeSingle()

  if (linkErr) throw linkErr
  if (!link) return { linked: false }

  const { data: txs, error: txErr } = await admin
    .from('smartcard')
    .select('amount, action')
    .eq('tel_no', link.tel_no)

  if (txErr) throw txErr

  const { data: reds, error: redErr } = await admin
    .from('reward_redemptions')
    .select('points_cost')
    .eq('line_user_id', lineUserId)
    .eq('status', 'approved')

  if (redErr) throw redErr

  const bahtPerPoint = getBahtPerPoint()
  const balanceBaht = computeNetBalanceFromTransactions(txs ?? [])
  const pointsEarned = computePointsEarnedFromTopups(txs ?? [], bahtPerPoint)
  const pointsSpent = (reds ?? []).reduce((s, r) => s + (r.points_cost ?? 0), 0)
  const pointsBalance = Math.max(0, pointsEarned - pointsSpent)

  return {
    linked: true,
    telNo: link.tel_no,
    mName: link.m_name,
    balanceBaht,
    pointsEarned,
    pointsSpent,
    pointsBalance,
    bahtPerPoint,
  }
}
