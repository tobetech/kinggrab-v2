'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SaleDetail} from '@/lib/types'
import { FiX, FiCalendar, FiPackage, FiDollarSign } from 'react-icons/fi'
import CuteIllustration from './CuteIllustration'

interface ProductDetailModalProps {
  productName: string
  isOpen: boolean
  onClose: () => void
  dateFilter?: string
}

export default function ProductDetailModal({
  productName,
  isOpen,
  onClose,
  dateFilter,
}: ProductDetailModalProps) {
  const [sales, setSales] = useState<SaleDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalQuantity, setTotalQuantity] = useState(0)

  useEffect(() => {
    if (isOpen && productName) {
      fetchProductSales()
    }
  }, [isOpen, productName, dateFilter])

  const fetchProductSales = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('sales')
        .select('id, M_Name, amount, quantity, sale_date, created_at')
        .eq('M_Name', productName)
        .order('sale_date', { ascending: false })

      if (dateFilter) {
        query = query.eq('sale_date', dateFilter)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedSales: SaleDetail[] = (data || []).map((sale: any) => ({
        id: sale.id,
        product_name: sale.M_Name || productName,
        quantity: sale.quantity ?? 1,
        total_amount: Number(sale.amount) || 0,
        sale_date: sale.sale_date,
        created_at: sale.created_at,
      }))

      setSales(formattedSales)

      // คำนวณยอดรวม
      const total = formattedSales.reduce((sum, sale) => sum + sale.total_amount, 0)
      const totalQty = formattedSales.reduce((sum, sale) => sum + sale.quantity, 0)
      setTotalAmount(total)
      setTotalQuantity(totalQty)
    } catch (error) {
      console.error('Error fetching product sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    // แปลงเป็นตัวเลขและจัดรูปแบบ
    const formatted = new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    return formatted + ' บาท'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-400 px-6 py-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <CuteIllustration type="dashboard" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">รายละเอียดยอดขาย</h3>
              <p className="text-sm text-pink-600 mt-1">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-pink-600 transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-pastel-pink/30 via-white to-pastel-rose/30 px-6 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 mb-4">
                  <CuteIllustration type="dashboard" />
                </div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-pastel-pink to-pastel-rose rounded-xl p-4 border-2 border-pastel-pink shadow-md">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FiPackage className="w-4 h-4" />
                      <span className="text-sm">จำนวนรวม</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{formatNumber(totalQuantity)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-pastel-rose to-pastel-pink rounded-xl p-4 border-2 border-pastel-rose shadow-md">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FiDollarSign className="w-4 h-4" />
                      <span className="text-sm">ยอดขายรวม</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-pastel-lavender to-pastel-pink rounded-xl p-4 border-2 border-pastel-lavender shadow-md">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FiCalendar className="w-4 h-4" />
                      <span className="text-sm">จำนวนรายการ</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{formatNumber(sales.length)}</p>
                  </div>
                </div>

                {/* Sales List */}
                {sales.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-32 h-32 mx-auto mb-4">
                      <CuteIllustration type="empty" />
                    </div>
                    <p className="text-gray-500 font-medium">ไม่พบข้อมูลการขาย{dateFilter ? ` ในวันที่ ${formatDate(dateFilter)}` : ''}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-pastel-pink/50 to-pastel-rose/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดขาย</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-pastel-pink/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatDate(sale.sale_date)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {formatNumber(sale.quantity)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                              {formatCurrency(sale.total_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gradient-to-r from-pastel-pink/50 to-pastel-rose/50">
                        <tr>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">รวม</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                            {formatNumber(totalQuantity)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                            {formatCurrency(totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-pastel-pink/30 to-pastel-rose/30 px-6 py-4 flex justify-end border-t-2 border-pastel-pink">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-300 text-white rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
