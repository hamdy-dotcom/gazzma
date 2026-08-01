'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Product } from '@/types'
import { supabase } from '@/lib/supabase'
import { ControlBar } from '@/components/ControlBar'
import { ProductPanel } from '@/components/ProductPanel'
import { CartDrawer } from '@/components/CartDrawer'
import { rigState } from "@/components/grid/gridState"

const ShoeGrid = dynamic(() => import('@/components/grid/ShoeGrid'), { ssr: false }) as any

export default function HomePage() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [brandFilter, setBrandFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data)
        setLoading(false)
      })
  }, [])

  const handleSelect = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleClose = () => {
    setSelectedProduct(null)
    rigState.activeId = null
  }

  // Sync rigState.activeId with selectedProduct
  useEffect(() => {
    const interval = setInterval(() => {
      if (rigState.activeId === null && selectedProduct !== null) {
        setSelectedProduct(null)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [selectedProduct])

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f0eb',
        flexDirection: 'column',
        gap: 16,
        direction: 'rtl',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid #ddd',
          borderTopColor: '#111',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#888', fontSize: 14 }}>جاري التحميل...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <main style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        direction: 'rtl',
        pointerEvents: 'none',
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 900,
            color: '#111',
            letterSpacing: -0.5,
          }}>
            SOLE OUTLET
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: '#888', fontWeight: 500 }}>
            أحذية أصلية بأسعار لا تصدق
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          padding: '6px 14px',
          fontSize: 12,
          fontWeight: 700,
          color: '#27ae60',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          🔥 خصم يصل لـ 60%
        </div>
      </div>

      {/* 3D Canvas */}
      <div style={{ width: '100%', height: '100%', transform: selectedProduct ? 'translateY(-15%)' : 'translateY(0)', transition: 'transform 0.3s ease' }}>
      <ShoeGrid
        products={products}
        brandFilter={brandFilter}
        priceFilter={priceFilter}
        onSelect={handleSelect}
      />
      </div>

      {/* Product detail panel */}
      <ProductPanel product={selectedProduct} onClose={handleClose} />

      {/* Filters + cart bar */}
      <ControlBar
        brandFilter={brandFilter}
        priceFilter={priceFilter}
        onBrandChange={setBrandFilter}
        onPriceChange={setPriceFilter}
      />

      {/* Cart drawer */}
      <CartDrawer />
    </main>
  )
}
