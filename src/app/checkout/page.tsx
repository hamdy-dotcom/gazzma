'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { EGYPT_GOVERNORATES } from '@/types'

const SHIPPING = 60

interface FormData {
  name: string
  phone: string
  address: string
  city: string
  governorate: string
  notes: string
  paymentMethod: 'cod' | 'paymob'
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: '', phone: '', address: '', city: '',
    governorate: 'القاهرة', notes: '', paymentMethod: 'cod',
  })

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address || !form.city) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            product_id: i.product.id,
            title: i.product.title,
            size: i.size,
            outlet_price_egp: i.product.outlet_price_egp,
            qty: i.qty,
            image_url: i.product.image_url,
          })),
          subtotal_egp: total(),
          shipping_egp: SHIPPING,
          total_egp: total() + SHIPPING,
        }),
      })
      const data = await res.json()
      if (form.paymentMethod === 'paymob' && data.paymobUrl) {
        window.location.href = data.paymobUrl
      } else {
        clearCart()
        router.push(`/order/${data.orderNumber}`)
      }
    } catch (err) {
      alert('حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) { router.replace('/'); return null }

  return (
    <div data-page="checkout" style={{
      height: '100vh', background: '#f8f7f5', direction: 'rtl',
      fontFamily: 'inherit', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '12px 20px', borderBottom: '1px solid #eee',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <button onClick={() => router.back()} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>→</button>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>إتمام الطلب</h1>
      </div>

      {/* Two column layout */}
      <div className="checkout-grid">
        {/* Left: Form */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Delivery */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: '#888' }}>بيانات التوصيل</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="الاسم" value={form.name} onChange={set('name')} placeholder="محمد أحمد" />
              <Field label="الهاتف" value={form.phone} onChange={set('phone')} placeholder="01xxxxxxxxx" type="tel" />
              <div style={{ gridColumn: '1/-1' }}>
                <Field label="العنوان" value={form.address} onChange={set('address')} placeholder="الشارع، رقم البيت..." />
              </div>
              <Field label="المدينة" value={form.city} onChange={set('city')} placeholder="مدينة نصر" />
              <div>
                <label style={labelStyle}>المحافظة</label>
                <select value={form.governorate} onChange={set('governorate')} style={inputStyle}>
                  {EGYPT_GOVERNORATES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: '#888' }}>طريقة الدفع</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <PayOption selected={form.paymentMethod === 'cod'} onClick={() => setForm(f => ({ ...f, paymentMethod: 'cod' }))} icon="💵" title="كاش عند الاستلام" />
              <PayOption selected={form.paymentMethod === 'paymob'} onClick={() => setForm(f => ({ ...f, paymentMethod: 'paymob' }))} icon="💳" title="بطاقة / محفظة" />
            </div>
          </div>
        </div>

        {/* Right: Summary + Submit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: '#888' }}>ملخص الطلب</h3>
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}`} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                borderBottom: '1px solid #f5f5f5', fontSize: 13,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{item.product.title}</div>
                  <div style={{ color: '#888', fontSize: 11 }}>مقاس {item.size} × {item.qty}</div>
                </div>
                <span style={{ fontWeight: 700 }}>{(item.product.outlet_price_egp * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#888' }}>
              <span>شحن</span><span>{SHIPPING} جنيه</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '2px solid #eee', fontWeight: 800, fontSize: 15 }}>
              <span>الإجمالي</span>
              <span style={{ color: '#c0392b' }}>{(total() + SHIPPING).toLocaleString()} جنيه</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.phone || !form.address || !form.city}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? '#ccc' : '#111', color: '#fff',
              fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            {loading ? 'جاري الإرسال...' : form.paymentMethod === 'cod' ? '🎉 تأكيد الطلب' : 'انتقل للدفع →'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string; type?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} type={type} style={inputStyle} />
    </div>
  )
}

function PayOption({ selected, onClick, icon, title }: {
  selected: boolean; onClick: () => void; icon: string; title: string
}) {
  return (
    <div onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
      borderRadius: 10, border: selected ? '2px solid #111' : '2px solid #eee',
      cursor: 'pointer', background: selected ? '#f8f8f8' : '#fff',
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
      <div style={{
        marginRight: 'auto', width: 18, height: 18, borderRadius: '50%',
        border: selected ? '5px solid #111' : '2px solid #ddd',
      }} />
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 4,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e5e5',
  fontSize: 13, background: '#fafafa', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', direction: 'rtl',
}
