// Paymob Egypt integration
// Docs: https://developers.paymob.com/egypt/docs

const PAYMOB_API_URL = 'https://accept.paymob.com/api'

export async function paymobAuth(): Promise<string> {
  const res = await fetch(`${PAYMOB_API_URL}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
  })
  const data = await res.json()
  if (!data.token) throw new Error('Paymob auth failed')
  return data.token
}

export async function paymobCreateOrder(
  token: string,
  amountCents: number,
  items: Array<{ name: string; amount_cents: number; quantity: number }>
): Promise<string> {
  const res = await fetch(`${PAYMOB_API_URL}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      items,
    }),
  })
  const data = await res.json()
  if (!data.id) throw new Error('Paymob order creation failed')
  return data.id
}

export async function paymobGetPaymentKey(
  token: string,
  orderId: string,
  amountCents: number,
  customer: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
  }
): Promise<string> {
  const res = await fetch(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        ...customer,
        apartment: 'NA',
        floor: 'NA',
        street: 'NA',
        building: 'NA',
        shipping_method: 'NA',
        postal_code: 'NA',
        city: 'NA',
        country: 'EG',
        state: 'NA',
      },
      currency: 'EGP',
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
    }),
  })
  const data = await res.json()
  if (!data.token) throw new Error('Paymob payment key failed')
  return data.token
}

export function paymobIframeUrl(paymentToken: string): string {
  return `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`
}
