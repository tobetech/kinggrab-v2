'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLineLiff } from '@/contexts/LineLiffContext'

function formatBaht(n: number) {
  return (
    new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' บาท'
  )
}

export default function LineHomePage() {
  const router = useRouter()
  const { ready, error, me, refreshMe } = useLineLiff()

  useEffect(() => {
    if (ready && me && !me.linked) {
      router.replace('/line/bind')
    }
  }, [ready, me, router])

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
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-24 pt-8">
      <header className="mb-6 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-gray-500">สวัสดี</p>
          <h1 className="text-2xl font-bold text-primary-800">King Grab สมาชิก</h1>
          {me.mName && <p className="text-sm text-gray-600">รหัส: {me.mName}</p>}
          <p className="text-xs text-gray-500">
            เบอร์{' '}
            {me.telNo.length === 10 && me.telNo.startsWith('0')
              ? `${me.telNo.slice(0, 3)}-${me.telNo.slice(3, 6)}-${me.telNo.slice(6)}`
              : me.telNo}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refreshMe()}
          className="shrink-0 rounded-lg border border-pastel-pink bg-white/80 px-3 py-1.5 text-xs font-medium text-primary-700 shadow-sm"
        >
          รีเฟรช
        </button>
      </header>

      <div className="grid gap-4">
        <section className="rounded-2xl border-2 border-white/80 bg-white/90 p-5 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-gray-500">ยอดเงินคงเหลือ (จากรายการ smartcard)</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{formatBaht(me.balanceBaht)}</p>
          <p className="mt-2 text-xs text-gray-500">{me.balanceNote}</p>
        </section>

        <section className="rounded-2xl border-2 border-white/80 bg-white/90 p-5 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-gray-500">คะแนนสะสม</p>
          <div className="mt-2 flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-500">ได้รับรวม</p>
              <p className="text-xl font-semibold text-primary-700">{me.pointsEarned} pt</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">แลกไปแล้ว</p>
              <p className="text-xl font-semibold text-gray-700">{me.pointsSpent} pt</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">คงเหลือแลกได้</p>
              <p className="text-2xl font-bold text-rose-600">{me.pointsBalance} pt</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            คิดจากยอด Topup / Topup_M / Addcard ทุก {me.bahtPerPoint} บาท = 1 คะแนน (ตั้งค่า LINE_BAHT_PER_POINT ได้)
          </p>
        </section>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/line/rewards"
          className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 py-4 text-center font-medium text-white shadow-md"
        >
          แลกของรางวัล
        </Link>
        <Link
          href="/"
          className="rounded-xl border-2 border-pastel-pink bg-white py-4 text-center text-sm font-medium text-gray-700"
        >
          กลับเว็บหลัก
        </Link>
      </div>
    </div>
  )
}
