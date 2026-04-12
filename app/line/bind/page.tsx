'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLineLiff } from '@/contexts/LineLiffContext'

export default function LineBindPage() {
  const router = useRouter()
  const { ready, error, me, refreshMe, getIdToken } = useLineLiff()
  const [tel, setTel] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ready && me?.linked) {
      router.replace('/line/home')
    }
  }, [ready, me, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) {
        setMsg('ยังไม่ได้เข้าสู่ระบบ LINE กรุณาลองใหม่')
        return
      }
      const res = await fetch('/api/line/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ telNo: tel }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(data.error || 'เชื่อมบัญชีไม่สำเร็จ')
        return
      }
      await refreshMe()
      router.replace('/line/home')
    } catch {
      setMsg('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (me?.linked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10">
      <h1 className="text-xl font-bold text-primary-700">เชื่อมบัญชีสมาชิก</h1>
      <p className="mt-2 text-sm text-gray-600">
        กรอกเบอร์โทรที่ใช้ในระบบร้าน (ต้องตรงกับคอลัมน์ <span className="font-mono">tel_no</span> ใน
        smartcard)
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="tel" className="block text-sm font-medium text-gray-700">
            เบอร์โทรศัพท์
          </label>
          <input
            id="tel"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-pastel-pink bg-white px-3 py-3 text-gray-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="0812345678"
            required
          />
        </div>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 py-3 font-medium text-white shadow-md disabled:opacity-50"
        >
          {loading ? 'กำลังเชื่อมบัญชี...' : 'ยืนยัน'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-gray-500">
        ต้องการความปลอดภัยสูงขึ้น แนะนำเพิ่ม OTP ยืนยันเบอร์ในอนาคต
      </p>
    </div>
  )
}
