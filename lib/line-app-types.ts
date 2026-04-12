/** ชนิดข้อมูลจาก GET /api/line/me (ใช้ใน LIFF) */

export type LineMeResponse =
  | { linked: false; error?: string }
  | {
      linked: true
      telNo: string
      mName: string | null
      balanceBaht: number
      pointsEarned: number
      pointsSpent: number
      pointsBalance: number
      bahtPerPoint: number
      balanceNote?: string
    }

export type RewardCatalogItem = {
  id: string
  name: string
  description: string | null
  image_url: string
  points_cost: number
  sort_order: number | null
}
