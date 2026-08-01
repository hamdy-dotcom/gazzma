'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total } = useCartStore()
  const router = useRouter()
  const SHIPPING = 60

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 300,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 'min(420px, 100vw)',
              background: '#fff',
              zIndex: 400,
              display: 'flex',
              flexDirection: 'column',
              direction: 'rtl',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>السلة</h2>
              <button
                onClick={closeCart}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f5f5f5',
                  fontSize: 20,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                  <p style={{ fontSize: 16 }}>السلة فارغة</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    style={{
                      display: 'flex',
                      gap: 14,
                      padding: '14px 0',
                      borderBottom: '1px solid #f5f5f5',
                      alignItems: 'center',
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      background: '#f8f8f8',
                      flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <img
                        src={item.product.image_url}
                        alt={item.product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#111' }}>
                        {item.product.title}
                      </p>
                      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#888' }}>
                        مقاس {item.size}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Qty */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => updateQty(item.product.id, item.size, item.qty - 1)}
                            style={qtyBtnStyle}
                          >−</button>
                          <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.id, item.size, item.qty + 1)}
                            style={qtyBtnStyle}
                          >+</button>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#c0392b' }}>
                          {(item.product.outlet_price_egp * item.qty).toLocaleString()} جنيه
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#ccc',
                        cursor: 'pointer',
                        fontSize: 18,
                        padding: 4,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#666', fontSize: 14 }}>المجموع</span>
                  <span style={{ fontWeight: 600 }}>{total().toLocaleString()} جنيه</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: '#666', fontSize: 14 }}>الشحن</span>
                  <span style={{ fontWeight: 600 }}>{SHIPPING} جنيه</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                  paddingTop: 12,
                  borderTop: '1px solid #eee',
                }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>الإجمالي</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: '#c0392b' }}>
                    {(total() + SHIPPING).toLocaleString()} جنيه
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { closeCart(); router.push('/checkout') }}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: 14,
                    border: 'none',
                    background: '#111',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  إتمام الطلب
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const qtyBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: '1px solid #eee',
  background: '#f8f8f8',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  fontWeight: 600,
}
