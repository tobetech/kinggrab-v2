'use client'

import { useState } from 'react'
import { 
  FiHome, 
  FiPhone, 
  FiTag, 
  FiServer,
  FiFilter,
  FiX
} from 'react-icons/fi'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  telNoFilter: string
  onTelNoFilterChange: (value: string) => void
  actionFilter: string
  onActionFilterChange: (value: string) => void
  mNameFilter: string
  onMNameFilterChange: (value: string) => void
  onClearFilters: () => void
  userEmail?: string
  adminData?: any
}

export default function Sidebar({
  activeView,
  onViewChange,
  telNoFilter,
  onTelNoFilterChange,
  actionFilter,
  onActionFilterChange,
  mNameFilter,
  onMNameFilterChange,
  onClearFilters,
  userEmail,
  adminData,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    {
      id: 'all',
      label: 'ข้อมูลทั้งหมด',
      icon: FiHome,
      description: 'แสดงข้อมูลทั้งหมดตามวันเวลาที่เลือก',
    },
    {
      id: 'telno',
      label: 'ตามหมายเลขโทรศัพท์',
      icon: FiPhone,
      description: 'แสดงข้อมูลเฉพาะหมายเลขโทรศัพท์ที่กำหนด',
    },
    {
      id: 'action',
      label: 'ตาม Action',
      icon: FiTag,
      description: 'แสดงข้อมูลตาม Action ที่เลือก',
    },
    {
      id: 'mname',
      label: 'ตามหมายเลขเครื่อง',
      icon: FiServer,
      description: 'แสดงข้อมูลเฉพาะหมายเลขเครื่องใน M_Name',
    },
  ]

  const actionOptions = [
    { value: 'Play', label: 'Play' },
    { value: 'Topup', label: 'Topup' },
    { value: 'Topup_M', label: 'Topup_M' },
    { value: 'Refund', label: 'Refund' },
    { value: 'Redeem', label: 'Redeem' },
    { value: 'Addcard', label: 'Addcard' },
    { value: 'Logout', label: 'Logout' },
  ]

  const hasActiveFilters = telNoFilter || actionFilter || mNameFilter

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/90 backdrop-blur-sm border-r-2 border-pastel-pink shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b-2 border-pastel-pink bg-gradient-to-r from-pastel-pink/30 to-pastel-rose/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiFilter className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  ตัวเลือก
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-2 hover:bg-pastel-pink rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Filters Section - ย้ายมาด้านบน */}
          <div className="p-4 border-b-2 border-pastel-pink bg-gradient-to-r from-pastel-pink/20 to-pastel-rose/20">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">ตัวกรองข้อมูล</h3>
            
            {/* Tel No Filter */}
            {activeView === 'telno' ? (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    <FiPhone className="inline w-4 h-4 mr-1 text-primary-600" />
                    หมายเลขโทรศัพท์ (tel_no)
                  </label>
                  <input
                    type="text"
                    value={telNoFilter}
                    onChange={(e) => onTelNoFilterChange(e.target.value)}
                    placeholder="กรอกหมายเลขโทรศัพท์..."
                    className="w-full px-3 py-2 border-2 border-pastel-pink rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white shadow-sm"
                    autoFocus
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    <FiTag className="inline w-4 h-4 mr-1 text-primary-600" />
                    Action (เพิ่มเติม)
                  </label>
                  <select
                    value={actionFilter}
                    onChange={(e) => onActionFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-pastel-pink rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white shadow-sm"
                  >
                    <option value="">-- เลือก Action (ไม่บังคับ) --</option>
                    {actionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}

            {/* Action Filter */}
            {activeView === 'action' ? (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <FiTag className="inline w-4 h-4 mr-1 text-primary-600" />
                  Action
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => onActionFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-pastel-pink rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white shadow-sm"
                >
                  <option value="">-- เลือก Action --</option>
                  {actionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* M_Name Filter */}
            {activeView === 'mname' ? (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <FiServer className="inline w-4 h-4 mr-1 text-primary-600" />
                  หมายเลขเครื่อง (M_Name)
                </label>
                <input
                  type="text"
                  value={mNameFilter}
                  onChange={(e) => onMNameFilterChange(e.target.value)}
                  placeholder="กรอกหมายเลขเครื่อง..."
                  className="w-full px-3 py-2 border-2 border-pastel-pink rounded-lg text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white shadow-sm"
                  autoFocus
                />
              </div>
            ) : null}

            {/* Show message when no filter view is selected */}
            {activeView === 'all' && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  เลือกตัวเลือกด้านล่างเพื่อกรองข้อมูล
                </p>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs font-medium"
              >
                ล้างตัวกรอง
              </button>
            )}

            {/* User Email Section */}
            {userEmail && (
              <div className="mt-4 pt-4 border-t-2 border-pastel-pink space-y-3">
                <div className="flex items-center gap-2 p-3 bg-white/80 rounded-lg border-2 border-pastel-pink">
                  <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">อีเมลที่ใช้ Login</p>
                    <p className="text-sm font-semibold text-gray-900 truncate" title={userEmail}>
                      {userEmail}
                    </p>
                  </div>
                </div>


                {/* Admin Status Section - แสดงเฉพาะ field status จาก Admin Table */}
                {adminData ? (
                  adminData.status ? (
                    <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Status
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Status:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {adminData.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <p className="text-xs text-gray-500 text-center">ไม่พบข้อมูล Status ใน Admin Table</p>
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <p className="text-xs text-gray-500 text-center">ไม่พบข้อมูลจาก Admin Table</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg'
                      : 'bg-pastel-pink/50 hover:bg-pastel-rose text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary-600'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs mt-1 ${isActive ? 'text-pink-100' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 lg:hidden p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
      >
        <FiFilter className="w-6 h-6" />
      </button>
    </>
  )
}
