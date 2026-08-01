export const CONFIG = {
  gridCols: 8,
  itemSize: 2.5,
  gap: 0.4,

  // Physics
  dragSpeed: 2.2,
  dampFactor: 0.2,
  tiltFactor: 0.08,
  clickThreshold: 5,
  dragResistance: 0.25,

  // Camera
  zoomIn: 12,
  zoomOut: 31,
  zoomDamp: 0.25,

  // Visuals
  focusScale: 1.5,
  dimScale: 0.5,
  dimOpacity: 0.15,

  // Curvature
  curvatureStrength: 0.06,
  rotationStrength: 0,

  // Culling
  cullDistance: 14,

  // Fog
  fogNear: 19,
  fogFar: 100,

  // Animation
  enterStartOpacity: 0.0,
  enterStartZ: -50,
  exitEndZ: 20,
  transitionZDamp: 0.25,
  enterOpacityDamp: 0.85,
  exitOpacityDamp: 0.15,
  enterStaggerDelay: 400,
  exitStaggerDelay: 300,
  cleanupTimeout: 700,
  exitSpreadY: 0.5,
  enterSpreadY: 1,
  transitionYDamp: 0.08,
  filterOpacityDamp: 0.06,
  filterScaleTarget: 0.5,

  bgColor: '#f5f0eb',
}

export const rigState = {
  current: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  zoom: 31,
  activeId: null as number | null,
  isDragging: false,
}

export function calculateGridDimensions(count: number) {
  const cols = CONFIG.gridCols
  const rows = Math.ceil(count / cols)
  const spacing = CONFIG.itemSize + CONFIG.gap
  return {
    width: cols * spacing,
    height: rows * spacing,
    rows,
    cols,
  }
}

export function matchesFilter(
  item: { brand: string; outlet_price_egp: number },
  brandFilter: string,
  priceFilter: string
): boolean {
  if (brandFilter !== 'all' && item.brand.toLowerCase() !== brandFilter.toLowerCase()) return false
  if (priceFilter === 'under500' && item.outlet_price_egp >= 500) return false
  if (priceFilter === '500-1000' && (item.outlet_price_egp < 500 || item.outlet_price_egp > 1000)) return false
  if (priceFilter === 'over1000' && item.outlet_price_egp <= 1000) return false
  return true
}
