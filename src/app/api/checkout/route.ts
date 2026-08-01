import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { paymobAuth, paymobCreateOrder, paymobGetPaymentKey, paymobIframeUrl } from '@/lib/paymob'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    name, phone, address, city, governorate, notes,
    items, subtotal_egp, shipping_egp, total_egp,
    paymentMethod,
  } = body

  const supabase = createServiceClient()

  // Insert order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name: name,
      phone,
      address,
      city,
      governorate,
      notes,
      items,
      subtotal_egp,
      shipping_egp,
      total_egp,
      payment_method: paymentMethod,
      status: 'pending',
    })
    .select()
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // COD — done
  if (paymentMethod === 'cod') {
    return NextResponse.json({ orderNumber: order.order_number })
  }

  // Paymob
  try {
    const token = await paymobAuth()
    const amountCents = Math.round(total_egp * 100)

    const paymobOrderId = await paymobCreateOrder(
      token,
      amountCents,
      items.map((i: any) => ({
        name: i.title,
        amount_cents: Math.round(i.outlet_price_egp * i.qty * 100),
        quantity: i.qty,
      }))
    )

    // Save paymob order id
    await supabase
      .from('orders')
      .update({ paymob_order_id: paymobOrderId })
      .eq('id', order.id)

    const nameParts = name.split(' ')
    const paymentKey = await paymobGetPaymentKey(token, paymobOrderId, amountCents, {
      first_name: nameParts[0] || name,
      last_name: nameParts.slice(1).join(' ') || 'N/A',
      email: 'guest@soleoutlet.eg',
      phone_number: phone,
    })

    return NextResponse.json({
      orderNumber: order.order_number,
      paymobUrl: paymobIframeUrl(paymentKey),
    })
  } catch (err) {
    console.error('Paymob error:', err)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}
