'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LineMeResponse } from '@/lib/line-app-types'

type LineLiffCtx = {
  ready: boolean
  error: string | null
  inClient: boolean
  me: LineMeResponse | null
  refreshMe: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const LineLiffContext = createContext<LineLiffCtx | null>(null)

export function LineLiffProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inClient, setInClient] = useState(false)
  const [me, setMe] = useState<LineMeResponse | null>(null)

  const fetchMe = useCallback(async () => {
    const liff = (await import('@line/liff')).default
    if (!liff.isLoggedIn()) {
      setMe(null)
      return
    }
    const token = liff.getIDToken()
    if (!token) {
      setMe(null)
      return
    }
    const res = await fetch('/api/line/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = (await res.json()) as LineMeResponse & { error?: string }
    if (!res.ok) {
      throw new Error((data as { error?: string }).error || 'โหลดข้อมูลสมาชิกไม่สำเร็จ')
    }
    setMe(data)
  }, [])

  const refreshMe = useCallback(async () => {
    try {
      await fetchMe()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'รีเฟรชไม่สำเร็จ')
    }
  }, [fetchMe])

  const getIdToken = useCallback(async () => {
    const liff = (await import('@line/liff')).default
    return liff.getIDToken()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID
        if (!liffId) {
          setError('ยังไม่ตั้งค่า NEXT_PUBLIC_LIFF_ID')
          setReady(true)
          return
        }
        const liff = (await import('@line/liff')).default
        await liff.init({ liffId })
        if (cancelled) return
        setInClient(liff.isInClient())

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href })
          return
        }

        await liff.getProfile()
        await fetchMe()
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'ไม่สามารถเปิด LINE ได้')
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchMe])

  const value = useMemo(
    () => ({
      ready,
      error,
      inClient,
      me,
      refreshMe,
      getIdToken,
    }),
    [ready, error, inClient, me, refreshMe, getIdToken]
  )

  return <LineLiffContext.Provider value={value}>{children}</LineLiffContext.Provider>
}

export function useLineLiff() {
  const ctx = useContext(LineLiffContext)
  if (!ctx) {
    throw new Error('useLineLiff ต้องอยู่ภายใต้ LineLiffProvider')
  }
  return ctx
}
