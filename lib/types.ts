export interface Transaction {
  id: string
  Card_No?: string
  tel_no?: string
  M_Name: string
  action: string
  amount: number
  created_at: string
}

export interface UserRole {
  role: 'admin' | 'user'
  allowed_actions?: string[] // สำหรับ user ที่จำกัด action
  allowed_tel_nos?: string[] // สำหรับ user ที่จำกัด Tel_No
  allowed_m_names?: string[] // สำหรับ user ที่จำกัด M_Name
}
