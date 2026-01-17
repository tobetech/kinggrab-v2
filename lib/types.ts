export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
}

export interface Sale {
  id: string
  product_id: string
  product?: Product
  quantity: number
  total_amount: number
  sale_date: string
  created_at?: string
}

export interface SalesByProduct {
  product_id: string
  product_name: string
  total_quantity: number
  total_amount: number
  sale_count: number
}

export interface SaleDetail {
  id: string
  product_id: string
  product_name: string
  quantity: number
  total_amount: number
  sale_date: string
  created_at?: string
}
