'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { rigState } from '@/components/grid/gridState'
import { CONFIG } from '@/components/grid/gridConfig'

const spring = { type: 'spring' as const, stiffness: 500, damping: 30, mass: 1 }

const ALL_BRANDS = ['Nike', 'Adidas', 'New Balance', 'Jordan', 'Puma', 'Vans', 'Converse', 'Reebok']
const TOP_BRANDS = ['Nike', 'Adidas', 'New Balance', 'Jordan']
const MORE_BRANDS = ALL_BRANDS.filter(b => !TOP_BRANDS.includes(b))

const PRICES = [
  { id: 'all', label: 'كل الأسعار' },
  { id: 'under500', label: 'أقل من 500' },
  { id: '500-1000', label: '500 - 1000' },
  { id: 'over1000', label: 'فوق 1000' },
]

interface ControlBarProps {
  brandFilter: string
  priceFilter: string
  onBrandChange: (b: string) => void
  onPriceChange: (p: string) => void
}

export function ControlBar({ brandFilter, priceFilter, onBrandChange, onPriceChange }: ControlBarProps) {
  const itemCount = useCartStore((s) => s.itemCount())
  const openCart = useCartStore((s) => s.openCart)
  const [showMore, setShowMore] = useState(false)

  const isMoreActive = MORE_BRANDS.includes(brandFilter)

  return (
    <>
      <style>{`
        .control-bar {
          position: fixed;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 100;
          pointer-events: none;
          padding: 0 12px;
        }
        .price-bar {
          display: flex;
          gap: 4px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          padding: 4px 6px;
          pointer-events: auto;
        }
        .brand-bar {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          padding: 4px 6px;
          pointer-events: auto;
        }
        .tab-btn {
          position: relative;
          border: none;
          background: transparent;
          color: #666;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
        }
        .tab-btn.active { color: #000; }
        .chip-btn {
          position: relative;
          border: none;
          background: rgba(0,0,0,0.05);
          color: #555;
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
        }
        .chip-btn.active {
          background: rgba(0,0,0,0.85);
          color: #fff;
        }
        .divider { width: 1px; height: 22px; background: rgba(0,0,0,0.08); flex-shrink: 0; margin: 0 2px; }
        .more-dropdown {
          position: absolute;
          bottom: 52px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 140px;
          z-index: 200;
        }
        .more-item {
          border: none;
          background: transparent;
          color: #333;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          width: 100%;
        }
        .more-item:hover { background: rgba(0,0,0,0.05); }
        .more-item.active { background: #111; color: #fff; }
      `}</style>

      <div className="control-bar">
        {/* Price filters */}
        <div className="price-bar">
          {PRICES.map((p) => (
            <button
              key={p.id}
              className={`chip-btn ${priceFilter === p.id ? 'active' : ''}`}
              onClick={() => onPriceChange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Brand tabs + zoom + cart */}
        <div className="brand-bar">
          {/* All */}
          <button
            className={`tab-btn ${brandFilter === 'all' ? 'active' : ''}`}
            onClick={() => onBrandChange('all')}
            style={{ position: 'relative' }}
          >
            الكل
            {brandFilter === 'all' && (
              <motion.div layoutId="activeTab" transition={spring} style={{
                position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.5)', zIndex: -1,
              }} />
            )}
          </button>

          {/* Top brands */}
          {TOP_BRANDS.map((b) => (
            <button
              key={b}
              className={`tab-btn ${brandFilter === b ? 'active' : ''}`}
              onClick={() => onBrandChange(b)}
              style={{ position: 'relative' }}
            >
              {b}
              {brandFilter === b && (
                <motion.div layoutId="activeTab" transition={spring} style={{
                  position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(10px)', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.5)', zIndex: -1,
                }} />
              )}
            </button>
          ))}

          {/* More dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className={`tab-btn ${isMoreActive ? 'active' : ''}`}
              onClick={() => setShowMore(v => !v)}
              style={{ position: 'relative' }}
            >
              {isMoreActive ? brandFilter : 'أكثر ▾'}
              {isMoreActive && (
                <motion.div layoutId="activeTab" transition={spring} style={{
                  position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(10px)', borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.5)', zIndex: -1,
                }} />
              )}
            </button>
            <AnimatePresence>
              {showMore && (
                <motion.div
                  className="more-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {MORE_BRANDS.map((b) => (
                    <button
                      key={b}
                      className={`more-item ${brandFilter === b ? 'active' : ''}`}
                      onClick={() => { onBrandChange(b); setShowMore(false) }}
                    >
                      {b}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="divider" />

          {/* Zoom out */}
          <motion.button whileTap={{ scale: 0.88 }}
            onClick={() => { rigState.zoom = Math.min(rigState.zoom + 5, CONFIG.zoomOut) }}
            style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'transparent', color: '#333', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 300 }}
          >−</motion.button>

          {/* Zoom in */}
          <motion.button whileTap={{ scale: 0.88 }}
            onClick={() => { rigState.zoom = Math.max(rigState.zoom - 5, CONFIG.zoomIn) }}
            style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'transparent', color: '#333', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 300 }}
          >+</motion.button>

          <div className="divider" />

          {/* Cart */}
          <motion.button whileTap={{ scale: 0.92 }}
            onClick={openCart}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none',
              background: itemCount > 0 ? '#111' : 'transparent',
              color: itemCount > 0 ? '#fff' : '#333',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', fontSize: 17, flexShrink: 0,
            }}
          >
            🛒
            {itemCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
                position: 'absolute', top: 5, right: 5,
                width: 14, height: 14, borderRadius: '50%',
                background: '#e74c3c', color: '#fff',
                fontSize: 8, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {itemCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </>
  )
}
