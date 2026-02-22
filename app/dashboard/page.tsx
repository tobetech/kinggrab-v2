'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Transaction, UserRole } from '@/lib/types'
import { FiLogOut, FiCalendar, FiX, FiDownload, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import CuteIllustration from '@/components/CuteIllustration'
import Sidebar from '@/components/Sidebar'

type ViewType = 'all' | 'telno' | 'action' | 'mname'

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [activeView, setActiveView] = useState<ViewType>('all')
  const [telNoFilter, setTelNoFilter] = useState<string>('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [mNameFilter, setMNameFilter] = useState<string>('')
  const [userRole, setUserRole] = useState<UserRole>({ role: 'user' })
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc') // desc = ใหม่ไปเก่า (สูงไปต่ำ), asc = เก่าไปใหม่ (ต่ำไปสูง)
  const [userStatus, setUserStatus] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [adminData, setAdminData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchUserRole()
  }, [])

  useEffect(() => {
    // รอให้ userRole โหลดเสร็จก่อน
    if (userRole.role) {
      fetchTransactions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, userRole.role])

  // Realtime subscription
  useEffect(() => {
    if (!userRole.role) return

    console.log('Setting up realtime subscription...')

    // สร้าง channel สำหรับ realtime subscription
    const channel = supabase
      .channel('smartcard-changes', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*', // ฟังทุก event (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'smartcard',
        },
        (payload) => {
          console.log('Realtime change detected:', payload)
          console.log('Event type:', payload.eventType)
          console.log('New record:', payload.new)
          console.log('Old record:', payload.old)
          
          // Refresh ข้อมูลเมื่อมีการเปลี่ยนแปลง
          setTimeout(() => {
            fetchTransactions()
          }, 500) // รอ 500ms เพื่อให้ database commit เสร็จก่อน
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription active')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime channel error - Please enable Realtime in Supabase Dashboard')
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Realtime subscription timed out')
        } else if (status === 'CLOSED') {
          console.log('Realtime subscription closed')
        }
      })

    // Cleanup subscription เมื่อ component unmount
    return () => {
      console.log('Cleaning up realtime subscription...')
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole.role])

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, activeView, telNoFilter, actionFilter, mNameFilter, sortOrder])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && user.email) {
        // ตั้งค่า email
        setUserEmail(user.email)
        
        console.log('Fetching admin data for email:', user.email)
        
        // ดึงข้อมูลทั้งหมดจากตาราง admin โดยใช้ email
        const { data: adminDataFromDB, error: adminError } = await supabase
          .from('admin')
          .select('*')
          .eq('email', user.email)
          .maybeSingle() // ใช้ maybeSingle() แทน single() เพื่อไม่ให้ error เมื่อไม่มีข้อมูล

        console.log('Fetching admin data for email:', user.email)
        console.log('Admin data from database:', adminDataFromDB)
        console.log('Admin error:', adminError)

        if (adminError) {
          console.error('Error fetching admin data:', adminError)
          setAdminData(null)
        } else if (adminDataFromDB) {
          setAdminData(adminDataFromDB)
          console.log('Admin data set successfully:', adminDataFromDB)
          
          // ตั้งค่า role จาก admin table
          setUserRole({
            role: adminDataFromDB.role || 'user',
            allowed_actions: adminDataFromDB.allowed_actions || [],
            allowed_tel_nos: adminDataFromDB.allowed_tel_nos || [],
            allowed_m_names: adminDataFromDB.allowed_m_names || [],
          })
          setUserStatus(adminDataFromDB.status || '')
        } else {
          setAdminData(null)
          console.log('No admin data found for email:', user.email)
          console.log('This is normal if the user is not in the admin table')
          
          // ถ้าไม่มีข้อมูล admin ให้ใช้ metadata
          const role = user.user_metadata?.role || 'user'
          setUserRole({
            role,
            allowed_actions: user.user_metadata?.allowed_actions || [],
            allowed_tel_nos: user.user_metadata?.allowed_tel_nos || [],
            allowed_m_names: user.user_metadata?.allowed_m_names || [],
          })
          setUserStatus('')
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      // Default to user role
      setUserRole({ role: 'user', allowed_actions: [], allowed_tel_nos: [], allowed_m_names: [] })
      setUserStatus('')
      setAdminData(null)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)

      console.log('Fetching transactions with filters:')
      console.log('Start Date:', startDate)
      console.log('End Date:', endDate)
      console.log('User Role:', userRole.role)

      let query = supabase
        .from('smartcard')
        .select('id, Card_No, tel_no, M_Name, action, amount, created_at')

      // กรองตามช่วงวันที่
      if (startDate) {
        // ใช้ startDate โดยตรง (Supabase จะแปลงเป็น timestamp)
        const startDateTime = `${startDate}T00:00:00.000Z`
        console.log('Filtering from:', startDateTime)
        query = query.gte('created_at', startDateTime)
      }
      if (endDate) {
        const endDateTime = `${endDate}T23:59:59.999Z`
        console.log('Filtering to:', endDateTime)
        query = query.lte('created_at', endDateTime)
      }

      // ถ้าไม่มีการเลือกวันที่ ให้ดึงข้อมูลทั้งหมด
      if (!startDate && !endDate) {
        console.log('No date filter - fetching all records')
      }

      // กรองตาม role - Admin เห็นทั้งหมด, User เห็นเฉพาะที่กำหนด
      if (userRole.role === 'user') {
        console.log('User role - applying restrictions')
        // กรองตาม allowed_actions
        if (userRole.allowed_actions && userRole.allowed_actions.length > 0) {
          console.log('Filtering by allowed_actions:', userRole.allowed_actions)
          query = query.in('action', userRole.allowed_actions)
        }
        // กรองตาม allowed_tel_nos
        if (userRole.allowed_tel_nos && userRole.allowed_tel_nos.length > 0) {
          console.log('Filtering by allowed_tel_nos:', userRole.allowed_tel_nos)
          query = query.in('tel_no', userRole.allowed_tel_nos)
        }
        // กรองตาม allowed_m_names
        if (userRole.allowed_m_names && userRole.allowed_m_names.length > 0) {
          console.log('Filtering by allowed_m_names:', userRole.allowed_m_names)
          query = query.in('M_Name', userRole.allowed_m_names)
        }
      }

      // เรียงลำดับตามวันเวลา
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched transactions:', data?.length || 0, 'records')
      if (data && data.length > 0) {
        console.log('Sample record:', data[0])
      }

      const formattedData: Transaction[] = (data || []).map((item: any) => ({
        id: item.id,
        Card_No: item.Card_No || '',
        tel_no: item.tel_no || '',
        M_Name: item.M_Name || '',
        action: item.action || '',
        amount: item.amount || 0,
        created_at: item.created_at || '',
      }))

      setTransactions(formattedData)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    console.log('Applying filters. Total transactions:', transactions.length)
    console.log('Active view:', activeView)
    console.log('Filters - telNo:', telNoFilter, 'action:', actionFilter, 'mName:', mNameFilter)

    // กรองตาม activeView
    switch (activeView) {
      case 'telno':
        // กรองตาม tel_no (บังคับ)
        if (telNoFilter) {
          filtered = filtered.filter(t => 
            t.tel_no?.toLowerCase().includes(telNoFilter.toLowerCase())
          )
        } else {
          // ถ้ายังไม่กรอง tel_no ให้แสดงทั้งหมด
          filtered = transactions
        }
        // กรองตาม action (เพิ่มเติม - ถ้ามี)
        if (actionFilter) {
          filtered = filtered.filter(t => t.action === actionFilter)
        }
        break

      case 'action':
        if (actionFilter) {
          filtered = filtered.filter(t => t.action === actionFilter)
        } else {
          // ถ้ายังไม่เลือก Action ให้แสดงทั้งหมด
          filtered = transactions
        }
        break

      case 'mname':
        if (mNameFilter) {
          filtered = filtered.filter(t => 
            t.M_Name?.toLowerCase().includes(mNameFilter.toLowerCase())
          )
        } else {
          // ถ้ายังไม่กรอง M_Name ให้แสดงทั้งหมด
          filtered = transactions
        }
        break

      case 'all':
      default:
        // แสดงทั้งหมด ไม่ต้องกรองเพิ่ม
        filtered = transactions
        break
    }

    // เรียงลำดับตามวันเวลา (created_at)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      if (sortOrder === 'desc') {
        return dateB - dateA // เรียงจากใหม่ไปเก่า (สูงไปต่ำ)
      } else {
        return dateA - dateB // เรียงจากเก่าไปใหม่ (ต่ำไปสูง)
      }
    })

    console.log('Filtered transactions:', filtered.length)

    setFilteredTransactions(filtered)

    // คำนวณยอดรวมใหม่หลังจาก filter
    const total = filtered.reduce((sum, t) => sum + t.amount, 0)
    setTotalAmount(total)
  }

  const exportToExcel = async () => {
    try {
      // Dynamic import xlsx
      const XLSX = await import('xlsx')
      
      const dataToExport = filteredTransactions.map(t => ({
        'วันที่และเวลา': formatDateTime(t.created_at),
        'Card No': userRole.role === 'admin' ? (t.Card_No || '') : '***',
        'Tel No': userRole.role === 'admin' ? (t.tel_no || '') : '***',
        'M Name': t.M_Name,
        'Action': t.action,
        'Amount': t.amount,
      }))

      const ws = XLSX.utils.json_to_sheet(dataToExport)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

      // สร้างชื่อไฟล์
      const fileName = `transactions_${startDate || 'all'}_${endDate || 'all'}.xlsx`
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('เกิดข้อผิดพลาดในการ Export Excel. กรุณาตรวจสอบว่าได้ติดตั้ง xlsx package แล้ว')
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    // แปลงเป็นตัวเลขและจัดรูปแบบ
    const formatted = new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
    return formatted + ' บาท'
  }

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
  }

  const clearAllFilters = () => {
    setTelNoFilter('')
    setActionFilter('')
    setMNameFilter('')
  }

  const handleViewChange = (view: string) => {
    setActiveView(view as ViewType)
    // Clear filters when changing view
    clearAllFilters()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-blush to-pastel-rose flex">
      {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          telNoFilter={telNoFilter}
          onTelNoFilterChange={setTelNoFilter}
          actionFilter={actionFilter}
          onActionFilterChange={setActionFilter}
          mNameFilter={mNameFilter}
          onMNameFilterChange={setMNameFilter}
          onClearFilters={clearAllFilters}
          userEmail={userEmail}
          adminData={adminData}
        />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b-2 border-pastel-pink">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12">
                  <CuteIllustration type="dashboard" />
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    Transaction Dashboard
                  </h1>
                  {userStatus && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300">
                      {userStatus}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-pastel-pink rounded-xl transition-all border-2 border-transparent hover:border-primary-300"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-pastel-pink mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">ยอดรวม Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredTransactions.length} รายการ
                </p>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-pastel-pink overflow-hidden mb-8">
            <div className="px-6 py-4 border-b-2 border-pastel-pink bg-gradient-to-r from-pastel-pink/30 to-pastel-rose/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FiCalendar className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    เลือกช่วงวันที่
                  </h2>
                </div>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-xl hover:from-green-600 hover:to-green-500 transition-all shadow-md hover:shadow-lg"
                >
                  <FiDownload className="w-5 h-5" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline w-4 h-4 mr-1" />
                    วันที่เริ่มต้น
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-pastel-pink rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline w-4 h-4 mr-1" />
                    วันที่สิ้นสุด
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-pastel-pink rounded-xl text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-gray-900"
                    />
                    {(startDate || endDate) && (
                      <button
                        onClick={clearDateFilter}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-pastel-pink rounded-xl transition-colors"
                        title="ล้างการกรองวันที่"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-pastel-pink overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-pastel-pink bg-gradient-to-r from-pastel-pink/30 to-pastel-rose/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10">
                    <CuteIllustration type="dashboard" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                        รายการ Transaction
                      </h2>
                      {userStatus && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-300">
                          {userStatus}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-600">Realtime อัปเดตอัตโนมัติ</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 mr-2">เรียงลำดับ:</span>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      sortOrder === 'desc'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-md'
                        : 'bg-pastel-pink/50 text-gray-700 hover:bg-pastel-rose'
                    }`}
                    title="เรียงจากใหม่ไปเก่า (สูงไปต่ำ)"
                  >
                    <FiArrowDown className="w-4 h-4" />
                    <span>ใหม่→เก่า</span>
                  </button>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      sortOrder === 'asc'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-md'
                        : 'bg-pastel-pink/50 text-gray-700 hover:bg-pastel-rose'
                    }`}
                    title="เรียงจากเก่าไปใหม่ (ต่ำไปสูง)"
                  >
                    <FiArrowUp className="w-4 h-4" />
                    <span>เก่า→ใหม่</span>
                  </button>
                </div>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-32 h-32 mx-auto mb-4">
                  <CuteIllustration type="empty" />
                </div>
                <p className="text-gray-500 font-medium mb-4">ไม่พบข้อมูล</p>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>กรุณาตรวจสอบ:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>วันที่ที่เลือกมีข้อมูลหรือไม่</li>
                    <li>Role และสิทธิ์การเข้าถึงข้อมูล</li>
                    <li>เปิด Browser Console (F12) เพื่อดู error logs</li>
                  </ul>
                  <button
                    onClick={() => {
                      setStartDate('')
                      setEndDate('')
                      fetchTransactions()
                    }}
                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    ล้างวันที่และดึงข้อมูลทั้งหมด
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-pastel-pink/50 to-pastel-rose/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่และเวลา</th>
                      {adminData?.status === 'admin' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tel No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">M Name</th>
                        </>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-pastel-pink/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDateTime(transaction.created_at)}
                        </td>
                        {adminData?.status === 'admin' && (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {transaction.Card_No || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {transaction.tel_no || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {transaction.M_Name}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.action === 'Play' ? 'bg-blue-100 text-blue-700' :
                            transaction.action === 'Topup' ? 'bg-purple-100 text-purple-700' :
                            transaction.action === 'Topup_M' ? 'bg-indigo-100 text-indigo-700' :
                            transaction.action === 'Refund' ? 'bg-red-100 text-red-700' :
                            transaction.action === 'Redeem' ? 'bg-green-100 text-green-700' :
                            transaction.action === 'Addcard' ? 'bg-yellow-100 text-yellow-700' :
                            transaction.action === 'Logout' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {transaction.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-pastel-pink/50 to-pastel-rose/50">
                    <tr>
                      <td colSpan={adminData?.status === 'admin' ? 5 : 2} className="px-4 py-3 text-sm font-bold text-gray-900">
                        รวมทั้งหมด
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                        {formatCurrency(totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
