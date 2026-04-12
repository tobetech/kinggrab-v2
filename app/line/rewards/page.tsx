'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLineLiff } from '@/contexts/LineLiffContext'
import type { RewardCatalogItem } from '@/lib/line-app-types'

export default function LineRewardsPage() {
  const router = useRouter()
  const { ready, error, me, getIdToken, refreshMe } = useLineLiff()
  const [items, setItems] = useState<RewardCatalogItem[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    if (ready && me && !me.linked) {
      router.replace('/line/bind')
    }
  }, [ready, me, router])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/line/rewards')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'โหลดไม่สำเร็จ')
        setItems(data.items ?? [])
      } catch (e) {
        setLoadErr(e instanceof Error ? e.message : 'โหลดรายการไม่สำเร็จ')
      }
    })()
  }, [])

  const redeem = async (id: string) => {
    setBanner(null)
    setRedeeming(id)
    try {
      const token = await getIdToken()
      if (!token) {
        setBanner('หมดเซสชัน LINE กรุณารีโหลด')
        return
      }
      const res = await fetch('/api/line/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rewardId: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBanner(data.error || 'แลกไม่สำเร็จ')
        return
      }
      setBanner(`แลก "${data.redeemed}" สำเร็จ (${data.pointsCost} คะแนน)`)
      await refreshMe()
    } finally {
      setRedeeming(null)
    }
  }

  if (!ready || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!me.linked) {
    return null
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href="/line/home" className="text-sm font-medium text-primary-700">
          ← กลับ
        </Link>
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-rose-600 shadow">
          เหลือ {me.pointsBalance} คะแนน
        </span>
      </div>
      <h1 className="text-xl font-bold text-primary-800">ของรางวัลแลกคะแนน</h1>
      <p className="mt-1 text-sm text-gray-600">แตะแลกเมื่อคะแนนพอ — รับของที่สาขาตามเงื่อนไข</p>

      {banner && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {banner}
        </div>
      )}
      {loadErr && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadErr}
        </div>
      )}

      <ul className="mt-6 space-y-5">
        {items.map((item) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-2xl border-2 border-white/80 bg-white/95 shadow-lg backdrop-blur"
          >
            <div className="relative aspect-[16/10] w-full bg-gray-100">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
              {item.description && <p className="mt-1 text-sm text-gray-600">{item.description}</p>}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-primary-700">{item.points_cost} คะแนน</span>
                <button
                  type="button"
                  disabled={redeeming === item.id || me.pointsBalance < item.points_cost}
                  onClick={() => redeem(item.id)}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {redeeming === item.id ? 'กำลังแลก...' : 'แลก'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {items.length === 0 && !loadErr && (
        <p className="mt-10 text-center text-sm text-gray-500">ยังไม่มีรายการของรางวัล (เพิ่มใน reward_catalog)</p>
      )}
    </div>
  )
}
