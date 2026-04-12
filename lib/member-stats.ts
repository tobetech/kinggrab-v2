/** การคำนวณค่าจากตาราง smartcard (ปรับ action ตามธุรกิจได้) */

export const POINTS_EARNING_ACTIONS = ['Topup', 'Topup_M', 'Addcard'] as const

export type PointEarningAction = (typeof POINTS_EARNING_ACTIONS)[number]

export function normalizeThaiPhone(input: string): string {
  let d = input.replace(/\D/g, '')
  if (d.startsWith('66')) {
    d = `0${d.slice(2)}`
  }
  return d
}

/** ยอดเงินคงเหลือแบบผลรวม amount ทุกรายการที่ tel_no ตรงกัน (สอดคล้องกับ Dashboard เดิม) */
export function computeNetBalanceFromTransactions(
  rows: { amount: string | number | null }[]
): number {
  return rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0)
}

/**
 * คะแนนสะสมจากยอดเติม: ปรับ ENV LINE_BAHT_PER_POINT (ดีฟอลต์ 10) = ทุก ๆ N บาท ได้ 1 คะแนน
 */
export function computePointsEarnedFromTopups(
  rows: { action: string | null; amount: string | number | null }[],
  bahtPerPoint: number
): number {
  if (!Number.isFinite(bahtPerPoint) || bahtPerPoint <= 0) return 0
  const set = new Set<string>(POINTS_EARNING_ACTIONS as unknown as string[])
  const topups = rows
    .filter((r) => r.action && set.has(r.action))
    .reduce((s, r) => s + Math.max(0, Number(r.amount ?? 0)), 0)
  return Math.floor(topups / bahtPerPoint)
}

export function getBahtPerPoint(): number {
  const raw = process.env.LINE_BAHT_PER_POINT
  const n = raw ? Number(raw) : 10
  return Number.isFinite(n) && n > 0 ? n : 10
}
