'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Product } from '@/types'
import { useCartStore } from '@/store/cart'

interface ProductPanelProps {
  product: Product | null
  onClose: () => void
}

export function ProductPanel({ product, onClose }: ProductPanelProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => { setSelectedSize(null); setAdded(false) }, [product?.id])

  const savingsPct = product
    ? Math.round(((product.original_price_egp - product.outlet_price_egp) / product.original_price_egp) * 100)
    : 0

  const handleAdd = () => {
    if (!product || !selectedSize) return
    addItem(product, selectedSize)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          data-panel="product"
          style={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: 'min(360px, 44vw)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            padding: '20px 24px',
            zIndex: 200,
            direction: 'rtl',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.07)',
              cursor: 'pointer',
              fontSize: 16,
              color: '#666',
            }}
          >×</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
              {product.brand}
            </span>
            <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              وفر {savingsPct}%
            </span>
          </div>

          <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.4 }}>
            {product.title}
          </h2>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#c0392b' }}>
              {product.outlet_price_egp.toLocaleString()} جنيه
            </span>
            <span style={{ fontSize: 13, color: '#aaa', textDecoration: 'line-through' }}>
              {product.original_price_egp.toLocaleString()} جنيه
            </span>
          </div>

          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px', fontWeight: 600 }}>اختر المقاس</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 8,
                      border: selectedSize === size ? '2px solid #111' : '1px solid #ddd',
                      background: selectedSize === size ? '#111' : '#fff',
                      color: selectedSize === size ? '#fff' : '#333',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >{size}</button>
                ))}
              </div>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            disabled={product.sizes?.length > 0 && !selectedSize}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 14,
              border: 'none',
              background: added ? '#27ae60' : (!selectedSize && product.sizes?.length > 0 ? '#ccc' : '#111'),
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: (!selectedSize && product.sizes?.length > 0) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {added ? '✓ تمت الإضافة' : 'أضف للسلة'}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
