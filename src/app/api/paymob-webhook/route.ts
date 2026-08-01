import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import crypto from 'crypto'

// Paymob sends HMAC-signed callbacks
// Docs: https://developers.paymob.com/egypt/docs/transaction-webhook

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Verify HMAC (optional but recommended)
  // const hmac = req.headers.get('x-hmac') || ''
  // const secret = process.env.PAYMOB_HMAC_SECRET || ''
  // ... verify here

  const { obj } = body
  if (!obj) return NextResponse.json({ ok: true })

  const { order, success } = obj
  const paymobOrderId = order?.id?.toString()

  if (!paymobOrderId) return NextResponse.json({ ok: true })

  const supabase = createServiceClient()

  if (success === true) {
    await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('paymob_order_id', paymobOrderId)
  } else {
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('paymob_order_id', paymobOrderId)
  }

  return NextResponse.json({ ok: true })
}
