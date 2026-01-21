'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SalesByProduct } from '@/lib/types'
import { FiLogOut, FiTrendingUp, FiPackage, FiDollarSign, FiShoppingCart, FiArrowUp, FiArrowDown, FiCalendar, FiX } from 'react-icons/fi'
import ProductDetailModal from '@/components/ProductDetailModal'
import CuteIllustration from '@/components/CuteIllustration'

type SortOrder = 'highest' | 'lowest' | 'none'

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<SalesByProduct[]>([])
  const [filteredSalesData, setFilteredSalesData] = useState<SalesByProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSales, setTotalSales] = useState(0)
  const [totalQuantity, setTotalQuantity] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [dateFilter, setDateFilter] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('none')
  const [selectedProduct, setSelectedProduct] = useState<{ name: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchSalesData()
  }, [])

  useEffect(() => {
    fetchSalesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter])

  useEffect(() => {
    applyFiltersAndSort()
  }, [salesData, sortOrder])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const fetchSalesData = async () => {
    try {
      setLoading(true)

      // สร้าง query
      let query = supabase
        .from('sales')
        .select('id, M_Name, amount, quantity, sale_date, created_at')

      // กรองตามวันที่ถ้ามี
      if (dateFilter) {
        query = query.eq('sale_date', dateFilter)
      }

      const { data: sales, error: salesError } = await query.order('sale_date', { ascending: false })

      if (salesError) throw salesError

      // คำนวณยอดรวม
      const total = sales?.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0) || 0
      const totalQty = sales?.reduce((sum, sale) => sum + (sale.quantity ?? 1), 0) || 0
      setTotalSales(total)
      setTotalQuantity(totalQty)
      setTotalTransactions(sales?.length || 0)

      // จัดกลุ่มตาม product
      const grouped: { [key: string]: SalesByProduct } = {}

      sales?.forEach((sale: any) => {
        const productName = sale.M_Name || 'ไม่ระบุชื่อ'
        const qty = sale.quantity ?? 1
        const amt = Number(sale.amount) || 0

        if (!grouped[productName]) {
          grouped[productName] = {
            product_name: productName,
            total_quantity: 0,
            total_amount: 0,
            sale_count: 0,
          }
        }

        grouped[productName].total_quantity += qty
        grouped[productName].total_amount += amt
        grouped[productName].sale_count += 1
      })

      setSalesData(Object.values(grouped))
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...salesData]

    // เรียงลำดับ
    if (sortOrder === 'highest') {
      filtered.sort((a, b) => b.total_amount - a.total_amount)
    } else if (sortOrder === 'lowest') {
      filtered.sort((a, b) => a.total_amount - b.total_amount)
    }

    setFilteredSalesData(filtered)
  }

  const handleProductClick = (productName: string) => {
    setSelectedProduct({ name: productName })
    setIsModalOpen(true)
  }

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order === sortOrder ? 'none' : order)
  }

  const clearDateFilter = () => {
    setDateFilter('')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-blush to-pastel-rose">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4">
            <CuteIllustration type="dashboard" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-blush to-pastel-rose">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b-2 border-pastel-pink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12">
                <CuteIllustration type="dashboard" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Sales Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-pastel-pink rounded-xl transition-all border-2 border-transparent hover:border-primary-300"
            >
              <FiLogOut className="w-5 h-5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">ยอดขายรวม</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary-200 to-primary-300 rounded-xl shadow-md">
                <FiDollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-pastel-rose hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">จำนวนสินค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(totalQuantity)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-pink-200 to-rose-300 rounded-xl shadow-md">
                <FiPackage className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-pastel-lavender hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">จำนวนรายการขาย</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(totalTransactions)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-200 to-pink-300 rounded-xl shadow-md">
                <FiShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales by Product Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-pastel-pink overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-pastel-pink bg-gradient-to-r from-pastel-pink/30 to-pastel-rose/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10">
                  <CuteIllustration type="dashboard" />
                </div>
                <FiTrendingUp className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">ยอดขายแยกตามสินค้า</h2>
              </div>
              
              {/* Filters and Sort */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-gray-500" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border-2 border-pastel-pink rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white/80"
                  />
                  {dateFilter && (
                    <button
                      onClick={clearDateFilter}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="ล้างการกรอง"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sort Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">เรียงตาม:</span>
                  <button
                    onClick={() => handleSortChange('highest')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
                      sortOrder === 'highest'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg'
                        : 'bg-pastel-pink text-gray-700 hover:bg-pastel-rose border-2 border-pastel-pink'
                    }`}
                  >
                    <FiArrowUp className="w-4 h-4" />
                    สูงสุด
                  </button>
                  <button
                    onClick={() => handleSortChange('lowest')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
                      sortOrder === 'lowest'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg'
                        : 'bg-pastel-pink text-gray-700 hover:bg-pastel-rose border-2 border-pastel-pink'
                    }`}
                  >
                    <FiArrowDown className="w-4 h-4" />
                    ต่ำสุด
                  </button>
                </div>
              </div>
            </div>
          </div>

          {salesData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-32 h-32 mx-auto mb-4">
                <CuteIllustration type="empty" />
              </div>
              <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลการขาย</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pastel-pink/50 to-pastel-rose/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สินค้า
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวนที่ขาย
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ยอดขายรวม
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวนรายการ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ยอดขายเฉลี่ยต่อรายการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSalesData.map((item) => {
                    const avgPerTransaction = item.sale_count > 0 
                      ? item.total_amount / item.sale_count 
                      : 0
                    return (
                  <tr
                    key={item.product_name}
                    onClick={() => handleProductClick(item.product_name)}
                        className="hover:bg-pastel-pink/50 transition-all cursor-pointer border-l-4 border-transparent hover:border-primary-400"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {formatNumber(item.total_quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(item.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                          {formatNumber(item.sale_count)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                          {formatCurrency(avgPerTransaction)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gradient-to-r from-pastel-pink/50 to-pastel-rose/50">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      รวมทั้งหมด
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      {formatNumber(totalQuantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      {formatCurrency(totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      {formatNumber(totalTransactions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      {formatCurrency(totalTransactions > 0 ? totalSales / totalTransactions : 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          productName={selectedProduct.name}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProduct(null)
          }}
          dateFilter={dateFilter}
        />
      )}
    </div>
  )
}
