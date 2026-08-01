import React, { useMemo, useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";

import { DEFAULT_CONFIG, CONFIG } from "./gridConfig";
import { rigState, calculateGridDimensions, EMPTY_COLORS, matchesFilter } from "./gridState";
import { useGridConfig } from "./useGridConfig";
import { Rig } from "./Rig";
import { GridCanvas } from "./GridCanvas";
import { TopologyBackground } from "../TopologyBackground";
import "../HoloCardMaterial";

export default function ShoeGrid({ products = [], brandFilter = "all", priceFilter = "all", onSelect }) {
  const { showLeva } = useGridConfig();
  const [currentCollection, setCurrentCollection] = useState(0);
  const [zoomTrigger, setZoomTrigger] = useState(null);
  const [nikeFilter, setNikeFilter] = useState("all");
  const [transitionStartTime, setTransitionStartTime] = useState(Date.now());
  const [gridVisible, setGridVisible] = useState(true);
  const [activeItems, setActiveItems] = useState([]);

  // Map Supabase products to the format GridCanvas expects
  const normalizedProducts = useMemo(() => {
    return products.map((p) => ({
      ...p,
      image_url: p.image_url,
      title: p.title,
      price: `${p.outlet_price_egp?.toLocaleString()} جنيه`,
      brand: p.brand,
      primary_color: p.primary_color || "gray",
      primary_color_hex: p.primary_color_hex || "#888888",
    }));
  }, [products]);

  // Filter based on brandFilter + priceFilter from parent
  const filteredItems = useMemo(() => {
    return normalizedProducts.filter((p) => {
      if (brandFilter !== "all" && p.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
      if (priceFilter === "under500" && p.outlet_price_egp >= 500) return false;
      if (priceFilter === "500-1000" && (p.outlet_price_egp < 500 || p.outlet_price_egp > 1000)) return false;
      if (priceFilter === "over1000" && p.outlet_price_egp <= 1000) return false;
      return true;
    });
  }, [normalizedProducts, brandFilter, priceFilter]);

  useEffect(() => {
    setTransitionStartTime(Date.now());
    setGridVisible(false);
    const t = setTimeout(() => {
      setActiveItems(filteredItems);
      setGridVisible(true);
      setTransitionStartTime(Date.now());
    }, CONFIG.cleanupTimeout);
    return () => clearTimeout(t);
  }, [brandFilter, priceFilter]);

  useEffect(() => {
    if (filteredItems.length > 0 && activeItems.length === 0) {
      setActiveItems(filteredItems);
    }
  }, [filteredItems]);

  useEffect(() => {
    if (!zoomTrigger) return;
    rigState.zoom = zoomTrigger;
    setZoomTrigger(null);
  }, [zoomTrigger]);

  const gridDims = useMemo(() => {
    const count = activeItems.length;
    return calculateGridDimensions(count);
  }, [activeItems]);

  return (
    <>
      <Leva hidden={true} />
      <Canvas
        camera={{ fov: 50, near: 0.1, far: 1000, position: [0, 0, CONFIG.zoomOut] }}
        style={{ background: CONFIG.bgColor, width: "100vw", height: "100vh" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <TopologyBackground />
          <Rig gridW={gridDims.width} gridH={gridDims.height} />
          <GridCanvas
            items={activeItems}
            gridVisible={gridVisible}
            transitionStartTime={transitionStartTime}
            interactive={true}
            filter="all"
            colorFilter={EMPTY_COLORS}
            onSelect={onSelect}
          />
          
        </Suspense>
      </Canvas>
    </>
  );
}
