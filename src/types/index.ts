export interface Product {
  id: string
  title: string
  brand: string
  sizes: string[]
  original_price_egp: number
  outlet_price_egp: number
  image_url: string
  primary_color: string | null
  primary_color_hex: string | null
  in_stock: boolean
  featured: boolean
  created_at: string
  model_url?: string | null
}

export interface CartItem {
  product: Product
  size: string
  qty: number
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  phone: string
  address: string
  city: string
  governorate: string
  items: OrderItem[]
  subtotal_egp: number
  shipping_egp: number
  total_egp: number
  payment_method: 'cod' | 'paymob'
  paymob_order_id?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  product_id: string
  title: string
  size: string
  outlet_price_egp: number
  qty: number
  image_url: string
}

export const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'القليوبية', 'الغربية', 'المنوفية', 'البحيرة', 'الإسماعيلية',
  'بورسعيد', 'السويس', 'دمياط', 'الفيوم', 'بني سويف',
  'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
  'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء',
]

export const BRANDS = ['Nike', 'Adidas', 'New Balance', 'Jordan', 'Puma', 'Reebok', 'Vans', 'Converse']
