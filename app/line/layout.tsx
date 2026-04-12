import type { Metadata } from 'next'
import { LineLiffProvider } from '@/contexts/LineLiffContext'

export const metadata: Metadata = {
  title: 'สมาชิก | King Grab',
  description: 'ยอดเงิน คะแนนสะสม แลกของรางวัล',
}

export default function LineLayout({ children }: { children: React.ReactNode }) {
  return (
    <LineLiffProvider>
      <div className="min-h-screen bg-gradient-to-br from-pastel-pink/40 via-pastel-blush/30 to-pastel-rose/40 text-gray-900">
        {children}
      </div>
    </LineLiffProvider>
  )
}
