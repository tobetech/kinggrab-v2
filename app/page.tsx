'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('เกิดข้อผิดพลาดในการตรวจสอบ session')
          // Redirect to login anyway
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        if (session) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } catch (err: any) {
        console.error('Error checking user:', err)
        setError(err.message || 'เกิดข้อผิดพลาด')
        // Redirect to login after showing error
        setTimeout(() => router.push('/login'), 2000)
      }
    }
    checkUser()
  }, [router])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-blush to-pastel-rose">
        <div className="text-center bg-white/90 p-6 rounded-xl shadow-lg">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-sm text-gray-600">กำลังเปลี่ยนเส้นทางไปหน้า Login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-blush to-pastel-rose">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  )
}
