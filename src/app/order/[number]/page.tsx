import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function OrderPage({ params }: { params: { number: string } }) {
  const supabase = createServiceClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', params.number)
    .single()

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl' }}>
        <p>الطلب غير موجود</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f7f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      direction: 'rtl',
      fontFamily: 'inherit',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '40px 32px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 900 }}>تم تأكيد طلبك!</h1>
        <p style={{ color: '#888', margin: '0 0 24px', fontSize: 15 }}>
          شكراً يا {order.customer_name}، طلبك عندنا
        </p>

        <div style={{
          background: '#f5f5f5',
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 24,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: '#888' }}>رقم الطلب</p>
          <p style={{ margin: '4px 0 0', fontWeight: 900, fontSize: 20, letterSpacing: 1 }}>
            {order.order_number}
          </p>
        </div>

        <div style={{ textAlign: 'right', marginBottom: 24 }}>
          {(order.items as any[]).map((item: any, i: number) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
              fontSize: 14,
            }}>
              <span>{item.title} — مقاس {item.size} × {item.qty}</span>
              <span style={{ fontWeight: 700 }}>{(item.outlet_price_egp * item.qty).toLocaleString()} جنيه</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontWeight: 800, fontSize: 15 }}>
            <span>الإجمالي</span>
            <span style={{ color: '#c0392b' }}>{order.total_egp.toLocaleString()} جنيه</span>
          </div>
        </div>

        <div style={{
          background: '#e8f5e9',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'right',
        }}>
          <span style={{ fontSize: 20 }}>📦</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#2e7d32' }}>هيتوصل على</p>
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{order.address}، {order.city}، {order.governorate}</p>
          </div>
        </div>

        <Link href="/" style={{
          display: 'block',
          padding: '14px',
          borderRadius: 14,
          background: '#111',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 15,
        }}>
          تسوق أكثر 👟
        </Link>
      </div>
    </div>
  )
}
