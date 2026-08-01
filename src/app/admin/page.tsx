'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, Product } from '@/types'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'معلق',        color: '#92400e', bg: '#fef3c7' },
  confirmed: { label: 'مؤكد',        color: '#1e40af', bg: '#dbeafe' },
  shipped:   { label: 'تم الشحن',    color: '#5b21b6', bg: '#ede9fe' },
  delivered: { label: 'تم التوصيل', color: '#065f46', bg: '#d1fae5' },
  cancelled: { label: 'ملغي',        color: '#991b1b', bg: '#fee2e2' },
}

type TabType = 'overview' | 'orders' | 'products' | 'add-product'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [tab, setTab] = useState<TabType>('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchOrders, setSearchOrders] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [newProduct, setNewProduct] = useState({ title: '', brand: 'Nike', original_price_egp: '', outlet_price_egp: '', image_url: '', sizes: '40,41,42,43,44,45', in_stock: true, featured: false })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const startEdit = (order: Order) => setEditingOrder({ customer_name: order.customer_name, phone: order.phone, address: order.address, city: order.city, governorate: order.governorate, notes: order.notes })

  const saveEdit = async () => {
    if (!selectedOrder || !editingOrder) return
    const { error } = await supabase.from('orders').update(editingOrder).eq('id', selectedOrder.id)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...editingOrder } as Order : o))
      setSelectedOrder(prev => prev ? { ...prev, ...editingOrder } as Order : null)
      setEditingOrder(null)
      showToast('تم حفظ التعديلات ✓')
    }
  }

  const saveProduct = async () => {
    if (!editingProduct) return
    setSavingProduct(true)
    const sizes = typeof editingProduct.sizes === 'string'
      ? (editingProduct.sizes as any).split(',').map((s: string) => s.trim()).filter(Boolean)
      : editingProduct.sizes
    const { error } = await supabase.from('products').update({
      title: editingProduct.title,
      brand: editingProduct.brand,
      original_price_egp: editingProduct.original_price_egp,
      outlet_price_egp: editingProduct.outlet_price_egp,
      image_url: editingProduct.image_url,
      sizes,
      in_stock: editingProduct.in_stock,
      featured: editingProduct.featured,
    }).eq('id', editingProduct.id)
    setSavingProduct(false)
    if (!error) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...editingProduct, sizes } : p))
      setEditingProduct(null)
      showToast('تم حفظ المنتج ✓')
    } else showToast('حدث خطأ')
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filename, file, { upsert: true })
    if (error) { showToast('فشل رفع الصورة'); return null }
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(filename)
    return urlData.publicUrl
  }

  const loadAll = async () => {
    setLoading(true)
    const [{ data: o }, { data: p }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
    ])
    if (o) setOrders(o as Order[])
    if (p) setProducts(p as Product[])
    setLoading(false)
  }

  const login = async () => {
    if (pass === 'gazzma123' || pass === 'admin') { setAuthed(true); loadAll() }
    else showToast('كلمة المرور غلط')
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o))
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null)
    showToast('تم تحديث الحالة ✓')
  }

  const toggleStock = async (id: string, in_stock: boolean) => {
    await supabase.from('products').update({ in_stock }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, in_stock } : p))
    showToast(in_stock ? 'تم إظهار المنتج ✓' : 'تم إخفاء المنتج ✓')
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    await supabase.from('products').update({ featured }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, featured } : p))
    showToast(featured ? 'تم تمييز المنتج ⭐' : 'تم إلغاء التمييز')
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف المنتج؟')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    showToast('تم حذف المنتج')
  }

  const addProduct = async () => {
    if (!newProduct.title || !newProduct.original_price_egp || !newProduct.outlet_price_egp || !newProduct.image_url) { showToast('أكمل جميع الحقول المطلوبة'); return }
    setSaving(true)
    const sizes = newProduct.sizes.split(',').map(s => s.trim()).filter(Boolean)
    const { data } = await supabase.from('products').insert({ title: newProduct.title, brand: newProduct.brand, original_price_egp: Number(newProduct.original_price_egp), outlet_price_egp: Number(newProduct.outlet_price_egp), image_url: newProduct.image_url, sizes, in_stock: newProduct.in_stock, featured: newProduct.featured }).select().single()
    setSaving(false)
    if (data) { setProducts(prev => [data as Product, ...prev]); setNewProduct({ title: '', brand: 'Nike', original_price_egp: '', outlet_price_egp: '', image_url: '', sizes: '40,41,42,43,44,45', in_stock: true, featured: false }); setTab('products'); showToast('تم إضافة المنتج ✓') }
    else showToast('حدث خطأ، حاول مرة أخرى')
  }

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl' }}>
      <div style={{ width: 360, padding: '40px 32px', background: '#161616', borderRadius: 20, border: '1px solid #2a2a2a' }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2 }}>GAZZMA</p>
        <h1 style={{ margin: '0 0 28px', fontSize: 24, fontWeight: 900, color: '#fff' }}>لوحة التحكم</h1>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="كلمة المرور" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #2a2a2a', background: '#0a0a0a', color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', direction: 'rtl', fontFamily: 'inherit', outline: 'none' }} />
        <button onClick={login} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#fff', color: '#000', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>دخول</button>
        {toast && <p style={{ textAlign: 'center', color: '#ef4444', marginTop: 12, fontSize: 14 }}>{toast}</p>}
      </div>
    </div>
  )

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = !searchOrders || o.customer_name.includes(searchOrders) || o.phone.includes(searchOrders) || o.order_number.includes(searchOrders)
    return matchStatus && matchSearch
  })

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_egp, 0)
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', direction: 'rtl', fontFamily: 'inherit', display: 'flex' }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, zIndex: 1000, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>{toast}</div>}

      <div style={{ width: 220, background: '#111', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, right: 0, overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px 16px' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 2 }}>GAZZMA</p>
          <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 900, color: '#fff' }}>Admin Panel</p>
        </div>
        <nav style={{ padding: '8px 12px', flex: 1 }}>
          {([['overview','📊','الرئيسية'],['orders','📦',`الطلبات (${orders.length})`],['products','👟',`المنتجات (${products.length})`],['add-product','➕','إضافة منتج']] as [TabType,string,string][]).map(([t,icon,label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#111' : '#888', fontWeight: tab === t ? 700 : 400, fontSize: 14, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, fontFamily: 'inherit' }}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid #222' }}>
          <button onClick={loadAll} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 تحديث</button>
        </div>
      </div>

      <div style={{ flex: 1, marginRight: 220, padding: '24px', overflowY: 'auto', minHeight: '100vh' }}>

        {tab === 'overview' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 900 }}>مرحباً 👋</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              {[['💰','إجمالي المبيعات',`${totalRevenue.toLocaleString()} جنيه`,'#065f46','#d1fae5'],['📅','طلبات اليوم',String(todayOrders),'#1e40af','#dbeafe'],['⏳','طلبات معلقة',String(orders.filter(o=>o.status==='pending').length),'#92400e','#fef3c7'],['👟','منتجات نشطة',String(products.filter(p=>p.in_stock).length),'#5b21b6','#ede9fe']].map(([icon,label,value,color,bg]) => (
                <div key={label} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #f0f0f0' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: bg as string, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>{icon}</div>
                  <p style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 900, color: color as string }}>{value}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>آخر الطلبات</h3>
                <button onClick={() => setTab('orders')} style={{ border: 'none', background: 'none', color: '#666', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>عرض الكل ←</button>
              </div>
              {orders.slice(0,6).map(order => (
                <div key={order.id} onClick={() => { setSelectedOrder(order); setTab('orders') }} style={{ padding: '14px 20px', borderBottom: '1px solid #f9f9f9', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14 }}>{order.customer_name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{(order.items as any[]).slice(0,2).map((i: any) => i.title.split(' ').slice(0,3).join(' ')).join(' · ')}</p>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 800, color: '#c0392b' }}>{order.total_egp.toLocaleString()} جنيه</p>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: STATUS_CONFIG[order.status].bg, color: STATUS_CONFIG[order.status].color }}>{STATUS_CONFIG[order.status].label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 360px' : '1fr', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <input value={searchOrders} onChange={e => setSearchOrders(e.target.value)} placeholder="ابحث بالاسم أو الهاتف..." style={{ flex: 1, minWidth: 180, padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 14, fontFamily: 'inherit', outline: 'none', direction: 'rtl', background: '#fff' }} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 14, fontFamily: 'inherit', cursor: 'pointer', background: '#fff' }}>
                  <option value="all">كل الحالات</option>
                  {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                {loading ? <p style={{ padding: 40, textAlign: 'center', color: '#888' }}>جاري التحميل...</p> :
                 filteredOrders.length === 0 ? <p style={{ padding: 40, textAlign: 'center', color: '#888' }}>لا توجد طلبات</p> :
                 filteredOrders.map(order => (
                  <div key={order.id} onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)} style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: selectedOrder?.id === order.id ? '#f8f8f8' : '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: 6 }}>{order.order_number}</span>
                        <p style={{ margin: '6px 0 2px', fontWeight: 700, fontSize: 15 }}>{order.customer_name}</p>
                        <p style={{ margin: 0, fontSize: 13, color: '#666', direction: 'ltr', textAlign: 'right' }}>{order.phone}</p>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#c0392b', fontSize: 16 }}>{order.total_egp.toLocaleString()} جنيه</p>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: STATUS_CONFIG[order.status].bg, color: STATUS_CONFIG[order.status].color }}>{STATUS_CONFIG[order.status].label}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{(order.items as any[]).map((i: any) => `${i.title.split(' ').slice(0,3).join(' ')} (${i.size})`).join(' · ')}</p>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                        <span>{order.payment_method === 'cod' ? '💵' : '💳'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', position: 'sticky', top: 0, height: 'fit-content', maxHeight: '100vh', overflowY: 'auto' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                  <h3 style={{ margin: 0, fontWeight: 800 }}>تفاصيل الطلب</h3>
                  <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: '#f5f5f5', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 14px' }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#888' }}>رقم الطلب</p>
                    <p style={{ margin: '2px 0 0', fontWeight: 900, fontFamily: 'monospace' }}>{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#888' }}>بيانات العميل</p>
                      {!editingOrder ? (
                        <button onClick={() => startEdit(selectedOrder)} style={{ border: 'none', background: '#f5f5f5', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ تعديل</button>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={saveEdit} style={{ border: 'none', background: '#111', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>حفظ</button>
                          <button onClick={() => setEditingOrder(null)} style={{ border: '1px solid #ddd', background: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>إلغاء</button>
                        </div>
                      )}
                    </div>
                    {editingOrder ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[['الاسم', 'customer_name'], ['الهاتف', 'phone'], ['العنوان', 'address'], ['المدينة', 'city'], ['المحافظة', 'governorate'], ['ملاحظات', 'notes']].map(([label, key]) => (
                          <div key={key}>
                            <label style={{ fontSize: 11, color: '#888', fontWeight: 700, display: 'block', marginBottom: 3 }}>{label}</label>
                            <input value={(editingOrder as any)[key] || ''} onChange={e => setEditingOrder(p => ({...p, [key]: e.target.value}))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', direction: 'rtl', outline: 'none' }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p style={{ margin: '0 0 2px', fontWeight: 700 }}>{selectedOrder.customer_name}</p>
                        <p style={{ margin: '0 0 2px', fontSize: 13, color: '#555', direction: 'ltr', textAlign: 'right' }}>{selectedOrder.phone}</p>
                        <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{selectedOrder.address}، {selectedOrder.city}، {selectedOrder.governorate}</p>
                        {selectedOrder.notes && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888', background: '#f9f9f9', padding: '6px 10px', borderRadius: 8 }}>📝 {selectedOrder.notes}</p>}
                      </>
                    )}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#888' }}>المنتجات</p>
                    {(selectedOrder.items as any[]).map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>
                        <div><p style={{ margin: 0, fontWeight: 600 }}>{item.title}</p><p style={{ margin: 0, color: '#888', fontSize: 12 }}>مقاس {item.size} × {item.qty}</p></div>
                        <span style={{ fontWeight: 700 }}>{(item.outlet_price_egp * item.qty).toLocaleString()} جنيه</span>
                      </div>
                    ))}
                    <div style={{ paddingTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 4 }}><span>شحن</span><span>{selectedOrder.shipping_egp} جنيه</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}><span>الإجمالي</span><span style={{ color: '#c0392b' }}>{selectedOrder.total_egp.toLocaleString()} جنيه</span></div>
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#888' }}>تغيير الحالة</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                        <button key={k} onClick={() => updateStatus(selectedOrder.id, k)} style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid', borderColor: selectedOrder.status === k ? v.color : '#e5e5e5', background: selectedOrder.status === k ? v.bg : '#fff', color: selectedOrder.status === k ? v.color : '#555', fontSize: 12, fontWeight: selectedOrder.status === k ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: '#f9f9f9', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#666' }}>
                    {selectedOrder.payment_method === 'cod' ? '💵 دفع عند الاستلام' : '💳 دفع أونلاين'} · {new Date(selectedOrder.created_at).toLocaleString('ar-EG')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>المنتجات ({products.length})</h2>
              <button onClick={() => setTab('add-product')} style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>➕ إضافة منتج</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {products.map(product => (
                <div key={product.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: editingProduct?.id === product.id ? '2px solid #111' : '1px solid #f0f0f0', opacity: product.in_stock ? 1 : 0.55 }}>
                  <div style={{ height: 150, background: '#f9f9f9', position: 'relative' }}>
                    <img src={editingProduct?.id === product.id ? editingProduct.image_url : product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 10 }} />
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {!product.in_stock && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>نفذ</span>}
                      {product.featured && <span style={{ background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>⭐ مميز</span>}
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    {editingProduct?.id === product.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div><label style={{ fontSize: 10, color: '#888', fontWeight: 700, display: 'block', marginBottom: 2 }}>البراند</label>
                          <select value={editingProduct.brand} onChange={e => setEditingProduct(p => p ? {...p, brand: e.target.value} : null)} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e5e5', fontSize: 12, fontFamily: 'inherit' }}>
                            {['Nike','Adidas','New Balance','Jordan','Puma','Vans','Converse','Reebok'].map(b => <option key={b}>{b}</option>)}
                          </select>
                        </div>
                        <div><label style={{ fontSize: 10, color: '#888', fontWeight: 700, display: 'block', marginBottom: 2 }}>الاسم</label>
                          <input value={editingProduct.title} onChange={e => setEditingProduct(p => p ? {...p, title: e.target.value} : null)} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e5e5', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' as const, direction: 'rtl' as const }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <div><label style={{ fontSize: 10, color: '#888', fontWeight: 700, display: 'block', marginBottom: 2 }}>السعر الأصلي</label>
                            <input type="number" value={editingProduct.original_price_egp} onChange={e => setEditingProduct(p => p ? {...p, original_price_egp: Number(e.target.value)} : null)} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e5e5', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
                          </div>
                          <div><label style={{ fontSize: 10, color: '#888', fontWeight: 700, display: 'block', marginBottom: 2 }}>سعر الاوتلت</label>
                            <input type="number" value={editingProduct.outlet_price_egp} onChange={e => setEditingProduct(p => p ? {...p, outlet_price_egp: Number(e.target.value)} : null)} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e5e5', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: '#888', fontWeight: 700, display: 'block', marginBottom: 2 }}>صورة المنتج</label>
                          <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            showToast('جاري رفع الصورة...')
                            const url = await uploadImage(file)
                            if (url) setEditingProduct(p => p ? {...p, image_url: url} : null)
                          }} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '2px dashed #e5e5e5', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: '#fafafa' }} />
                          {editingProduct.image_url && (
                            <img src={editingProduct.image_url} alt="preview" style={{ width: '100%', height: 80, objectFit: 'contain', marginTop: 6, background: '#f9f9f9', borderRadius: 6, padding: 4 }} />
                          )}
                        </div>
                        <div><label style={{ fontSize: 10, color: '#888', fontWeight: 700, display: 'block', marginBottom: 2 }}>المقاسات</label>
                          <input value={Array.isArray(editingProduct.sizes) ? editingProduct.sizes.join(',') : editingProduct.sizes} onChange={e => setEditingProduct(p => p ? {...p, sizes: e.target.value as any} : null)} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e5e5', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={saveProduct} disabled={savingProduct} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{savingProduct ? '...' : '✓ حفظ'}</button>
                          <button onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>إلغاء</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{ margin: '0 0 2px', fontSize: 10, color: '#888', fontWeight: 700, letterSpacing: 1 }}>{product.brand}</p>
                        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>{product.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#c0392b' }}>{product.outlet_price_egp.toLocaleString()}</span>
                          <span style={{ fontSize: 11, color: '#aaa', textDecoration: 'line-through' }}>{product.original_price_egp.toLocaleString()}</span>
                          <span style={{ fontSize: 11, color: '#059669', fontWeight: 700, marginRight: 'auto' }}>-{Math.round((1 - product.outlet_price_egp / product.original_price_egp) * 100)}%</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setEditingProduct({...product, sizes: product.sizes})} style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid #e5e5e5', background: '#f9f9f9', color: '#333', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ تعديل</button>
                          <button onClick={() => toggleStock(product.id, !product.in_stock)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e5e5', background: product.in_stock ? '#f9f9f9' : '#111', color: product.in_stock ? '#333' : '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>{product.in_stock ? '🙈' : '👁'}</button>
                          <button onClick={() => toggleFeatured(product.id, !product.featured)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e5e5', background: product.featured ? '#fef3c7' : '#f9f9f9', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>⭐</button>
                          <button onClick={() => deleteProduct(product.id)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #fee2e2', background: '#fff5f5', color: '#ef4444', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>🗑</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'add-product' && (
          <div style={{ maxWidth: 580 }}>
            <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 900 }}>إضافة منتج جديد</h2>
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={ls}>اسم المنتج *</label><input value={newProduct.title} onChange={e => setNewProduct(p => ({...p, title: e.target.value}))} placeholder="Nike Dunk Low 'Panda'" style={is} /></div>
              <div><label style={ls}>البراند *</label><select value={newProduct.brand} onChange={e => setNewProduct(p => ({...p, brand: e.target.value}))} style={is}>{['Nike','Adidas','New Balance','Jordan','Puma','Vans','Converse','Reebok'].map(b => <option key={b}>{b}</option>)}</select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={ls}>السعر الأصلي (جنيه) *</label><input value={newProduct.original_price_egp} onChange={e => setNewProduct(p => ({...p, original_price_egp: e.target.value}))} placeholder="5000" type="number" style={is} /></div>
                <div><label style={ls}>سعر الاوتلت (جنيه) *</label><input value={newProduct.outlet_price_egp} onChange={e => setNewProduct(p => ({...p, outlet_price_egp: e.target.value}))} placeholder="2000" type="number" style={is} /></div>
              </div>
              {newProduct.original_price_egp && newProduct.outlet_price_egp && Number(newProduct.original_price_egp) > 0 && Number(newProduct.outlet_price_egp) > 0 && (
                <div style={{ background: '#d1fae5', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#065f46' }}>
                  ✓ خصم {Math.round((1 - Number(newProduct.outlet_price_egp)/Number(newProduct.original_price_egp))*100)}% — توفير {(Number(newProduct.original_price_egp)-Number(newProduct.outlet_price_egp)).toLocaleString()} جنيه
                </div>
              )}
              <div>
                <label style={ls}>صورة المنتج *</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  showToast('جاري رفع الصورة...')
                  const url = await uploadImage(file)
                  if (url) { setNewProduct(p => ({...p, image_url: url})); showToast('تم رفع الصورة ✓') }
                }} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '2px dashed #e5e5e5', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', background: '#fafafa' }} />
                {newProduct.image_url && (
                  <div style={{ height: 150, background: '#f9f9f9', borderRadius: 12, marginTop: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={newProduct.image_url} alt="preview" style={{ height: '100%', objectFit: 'contain', padding: 12 }} />
                  </div>
                )}
              </div>
              <div><label style={ls}>المقاسات (مفصولة بفاصلة)</label><input value={newProduct.sizes} onChange={e => setNewProduct(p => ({...p, sizes: e.target.value}))} placeholder="40,41,42,43,44,45" style={is} /></div>
              <div style={{ display: 'flex', gap: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}><input type="checkbox" checked={newProduct.in_stock} onChange={e => setNewProduct(p => ({...p, in_stock: e.target.checked}))} />متاح في المخزن</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}><input type="checkbox" checked={newProduct.featured} onChange={e => setNewProduct(p => ({...p, featured: e.target.checked}))} />⭐ منتج مميز</label>
              </div>
              <button onClick={addProduct} disabled={saving} style={{ padding: '15px', borderRadius: 14, border: 'none', background: saving ? '#ccc' : '#111', color: '#fff', fontSize: 15, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'جاري الحفظ...' : '✓ إضافة المنتج'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ls: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 6 }
const is: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 14, background: '#fafafa', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', direction: 'rtl' }
