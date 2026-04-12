'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLineLiff } from '@/contexts/LineLiffContext'

export default function LineEntryPage() {
  const router = useRouter()
  const { ready, error, me } = useLineLiff()

  useEffect(() => {
    if (!ready || !me) return
    if (!me.linked) {
      router.replace('/line/bind')
    } else {
      router.replace('/line/home')
    }
  }, [ready, me, router])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="mt-2 text-sm text-gray-600">ตรวจสอบ LIFF ID และเปิดจากลิงก์ใน LINE</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      <p className="text-sm text-gray-600">กำลังเตรียมระบบสมาชิก...</p>
    </div>
  )
}
