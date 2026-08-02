'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ModelViewerProps {
  modelUrl: string
  productName: string
  onClose: () => void
}

export function ModelViewer({ modelUrl, productName, onClose }: ModelViewerProps) {
  const iframeSrc = `data:text/html,<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #1a1a1a; width: 100vw; height: 100vh; }
  model-viewer { width: 100%; height: 100%; }
</style>
</head>
<body>
<model-viewer
  src="${modelUrl}"
  alt="${productName}"
  auto-rotate
  camera-controls
  shadow-intensity="1"
  environment-image="neutral"
  ar
  ar-modes="webxr scene-viewer quick-look"
></model-viewer>
</body>
</html>`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
          zIndex: 500, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
        onClick={onClose}
      >
        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'min(600px, 95vw)' }}>
          {/* Header */}
          <div style={{
            width: '100%', padding: '12px 16px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', direction: 'rtl',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>عرض ثلاثي الأبعاد</p>
              <h3 style={{ margin: '2px 0 0', color: '#fff', fontSize: 15, fontWeight: 700 }}>{productName}</h3>
            </div>
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              fontSize: 18, cursor: 'pointer',
            }}>×</button>
          </div>

          {/* Iframe viewer — isolated WebGL context */}
          <iframe
            srcDoc={`<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #111; width: 100vw; height: 100vh; }
  model-viewer { width: 100%; height: 100%; --poster-color: #111; }
</style>
</head>
<body>
<model-viewer
  src="${modelUrl}"
  alt="${productName}"
  auto-rotate
  camera-controls
  shadow-intensity="1"
  environment-image="neutral"
  ar
  ar-modes="webxr scene-viewer quick-look"
  loading="eager"
></model-viewer>
</body>
</html>`}
            style={{
              width: '100%',
              height: 'min(500px, 65vh)',
              border: 'none',
              borderRadius: 16,
              background: '#111',
            }}
            allow="xr-spatial-tracking"
          />

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 10, direction: 'rtl' }}>
            اسحب للتدوير · قرصة للتكبير · 📱 AR على الجوال
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
